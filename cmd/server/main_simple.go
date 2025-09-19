package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	r := gin.Default()

	// Add CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":     "healthy",
			"timestamp":  time.Now().Unix(),
			"message":    "Fast Image Resizer & Optimizer is running!",
			"version":    "1.0.0-simple",
			"note":       "This is a simplified version without image processing capabilities",
		})
	})

	// Mock resize endpoint (without actual image processing)
	r.GET("/resize", func(c *gin.Context) {
		url := c.Query("url")
		widthStr := c.Query("width")
		heightStr := c.Query("height")
		qualityStr := c.Query("quality")
		format := c.Query("format")

		if url == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "URL parameter is required"})
			return
		}

		width, err := strconv.Atoi(widthStr)
		if err != nil || width <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Valid width parameter is required"})
			return
		}

		height, err := strconv.Atoi(heightStr)
		if err != nil || height <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Valid height parameter is required"})
			return
		}

		quality := 80
		if qualityStr != "" {
			if q, err := strconv.Atoi(qualityStr); err == nil && q > 0 && q <= 100 {
				quality = q
			}
		}

		if format == "" {
			format = "jpeg"
		}

		// Mock response - in a real implementation, this would process the image
		c.JSON(http.StatusOK, gin.H{
			"message": "Image resize request received",
			"parameters": gin.H{
				"url":     url,
				"width":   width,
				"height":  height,
				"quality": quality,
				"format":  format,
			},
			"note": "This is a mock response. In the full version, the image would be downloaded, processed, and returned.",
		})
	})

	// Mock upload endpoint
	r.POST("/resize", func(c *gin.Context) {
		file, header, err := c.Request.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
			return
		}
		defer file.Close()

		widthStr := c.PostForm("width")
		heightStr := c.PostForm("height")
		qualityStr := c.PostForm("quality")
		format := c.PostForm("format")

		width, err := strconv.Atoi(widthStr)
		if err != nil || width <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Valid width parameter is required"})
			return
		}

		height, err := strconv.Atoi(heightStr)
		if err != nil || height <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Valid height parameter is required"})
			return
		}

		quality := 80
		if qualityStr != "" {
			if q, err := strconv.Atoi(qualityStr); err == nil && q > 0 && q <= 100 {
				quality = q
			}
		}

		if format == "" {
			format = "jpeg"
		}

		// Read file info
		fileData, err := io.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read uploaded file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Image upload and resize request received",
			"file_info": gin.H{
				"filename": header.Filename,
				"size":     len(fileData),
			},
			"parameters": gin.H{
				"width":   width,
				"height":  height,
				"quality": quality,
				"format":  format,
			},
			"note": "This is a mock response. In the full version, the image would be processed and returned.",
		})
	})

	// API documentation endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"name":        "Fast Image Resizer & Optimizer (Simple Demo)",
			"version":     "1.0.0-simple",
			"description": "A demonstration of the Fast Image Resizer & Optimizer API",
			"note":        "This is a simplified version without actual image processing. The full version would include libvips for high-performance image operations.",
			"endpoints": gin.H{
				"GET /health": gin.H{
					"description": "Health check endpoint",
				},
				"GET /resize": gin.H{
					"description": "Mock image resize from URL",
					"parameters": gin.H{
						"url":     "Image URL (required)",
						"width":   "Target width (required)",
						"height":  "Target height (required)",
						"quality": "JPEG quality 1-100 (optional, default: 80)",
						"format":  "Output format: jpeg, png, webp (optional, default: jpeg)",
					},
					"example": "/resize?url=https://example.com/image.jpg&width=400&height=300&quality=85&format=jpeg",
				},
				"POST /resize": gin.H{
					"description": "Mock image resize from upload",
					"parameters": gin.H{
						"image":   "Image file (multipart/form-data, required)",
						"width":   "Target width (required)",
						"height":  "Target height (required)",
						"quality": "JPEG quality 1-100 (optional, default: 80)",
						"format":  "Output format: jpeg, png, webp (optional, default: jpeg)",
					},
				},
			},
		})
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Starting Fast Image Resizer & Optimizer (Simple Demo) on port %s", port)
	log.Printf("📋 Health check: http://localhost:%s/health", port)
	log.Printf("📖 API documentation: http://localhost:%s/", port)
	log.Printf("🖼️  Try: curl \"http://localhost:%s/resize?url=https://picsum.photos/800/600&width=400&height=300\"", port)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
