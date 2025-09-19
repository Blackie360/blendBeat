package handler

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/blackie/blendBeat/internal/cache"
	"github.com/blackie/blendBeat/internal/processor"
	"github.com/gin-gonic/gin"
)

// ImageHandler handles HTTP requests for image processing
type ImageHandler struct {
	processor *processor.ImageProcessor
	cache     *cache.ImageCache
}

// NewImageHandler creates a new image handler
func NewImageHandler(processor *processor.ImageProcessor, cache *cache.ImageCache) *ImageHandler {
	return &ImageHandler{
		processor: processor,
		cache:     cache,
	}
}

// ResizeRequest represents a resize request
type ResizeRequest struct {
	URL     string `form:"url" json:"url"`
	Width   int    `form:"width" json:"width" binding:"required"`
	Height  int    `form:"height" json:"height" binding:"required"`
	Quality int    `form:"quality" json:"quality"`
	Format  string `form:"format" json:"format"`
}

// ResizeFromURL handles GET requests for resizing images from URLs
func (h *ImageHandler) ResizeFromURL(c *gin.Context) {
	var req ResizeRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate URL
	if req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL parameter is required"})
		return
	}

	// Validate dimensions
	if req.Width <= 0 || req.Height <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Width and height must be positive integers"})
		return
	}

	// Set defaults
	if req.Quality == 0 {
		req.Quality = 80
	}
	if req.Format == "" {
		req.Format = "jpeg"
	}

	// Download image from URL
	imageData, err := h.downloadImage(req.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to download image: %v", err)})
		return
	}

	// Process the image
	processedData, err := h.processImage(imageData, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process image: %v", err)})
		return
	}

	// Set response headers
	contentType := h.getContentType(req.Format)
	c.Header("Content-Type", contentType)
	c.Header("Content-Length", strconv.Itoa(len(processedData)))
	c.Header("Cache-Control", "public, max-age=3600")

	// Return the processed image
	c.Data(http.StatusOK, contentType, processedData)
}

// ResizeFromUpload handles POST requests for resizing uploaded images
func (h *ImageHandler) ResizeFromUpload(c *gin.Context) {
	var req ResizeRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get uploaded file
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}
	defer file.Close()

	// Validate file size (max 10MB)
	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size too large (max 10MB)"})
		return
	}

	// Read file data
	imageData, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read uploaded file"})
		return
	}

	// Process the image
	processedData, err := h.processImage(imageData, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process image: %v", err)})
		return
	}

	// Set response headers
	contentType := h.getContentType(req.Format)
	c.Header("Content-Type", contentType)
	c.Header("Content-Length", strconv.Itoa(len(processedData)))
	c.Header("Cache-Control", "public, max-age=3600")

	// Return the processed image
	c.Data(http.StatusOK, contentType, processedData)
}

// HealthCheck returns the health status of the service
func (h *ImageHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"cache_size": h.cache.Size(),
	})
}

// processImage processes an image with caching
func (h *ImageHandler) processImage(imageData []byte, req ResizeRequest) ([]byte, error) {
	// Validate image
	if err := h.processor.ValidateImage(imageData); err != nil {
		return nil, err
	}

	// Generate cache key
	cacheKey := h.cache.GenerateKey(imageData, req.Width, req.Height, req.Quality, req.Format)

	// Check cache first
	if cachedData, found := h.cache.Get(cacheKey); found {
		return cachedData, nil
	}

	// Process image
	options := processor.ResizeOptions{
		Width:   req.Width,
		Height:  req.Height,
		Quality: req.Quality,
		Format:  req.Format,
	}

	processedData, err := h.processor.ResizeImage(imageData, options)
	if err != nil {
		return nil, err
	}

	// Cache the result
	h.cache.Set(cacheKey, processedData)

	return processedData, nil
}

// downloadImage downloads an image from a URL
func (h *ImageHandler) downloadImage(url string) ([]byte, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return nil, fmt.Errorf("URL does not point to an image (content-type: %s)", contentType)
	}

	// Limit response size (max 50MB)
	limitedReader := io.LimitReader(resp.Body, 50*1024*1024)
	return io.ReadAll(limitedReader)
}

// getContentType returns the appropriate content type for the format
func (h *ImageHandler) getContentType(format string) string {
	switch format {
	case "jpeg", "jpg":
		return "image/jpeg"
	case "png":
		return "image/png"
	case "webp":
		return "image/webp"
	default:
		return "image/jpeg"
	}
}
