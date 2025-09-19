package main

import (
	"log"
	"os"
	"time"

	"github.com/blackie/blendBeat/internal/cache"
	"github.com/blackie/blendBeat/internal/handler"
	"github.com/blackie/blendBeat/internal/processor"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize components
	imageProcessor := processor.NewImageProcessor()
	imageCache := cache.NewImageCache(1 * time.Hour) // Cache for 1 hour
	imageHandler := handler.NewImageHandler(imageProcessor, imageCache)

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
	r.GET("/health", imageHandler.HealthCheck)

	// Image processing endpoints
	r.GET("/resize", imageHandler.ResizeFromURL)
	r.POST("/resize", imageHandler.ResizeFromUpload)

	// API documentation endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"name":        "Fast Image Resizer & Optimizer",
			"version":     "1.0.0",
			"description": "A fast image resizing and optimization service",
			"endpoints": gin.H{
				"GET /resize": gin.H{
					"description": "Resize image from URL",
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
					"description": "Resize uploaded image",
					"parameters": gin.H{
						"image":   "Image file (multipart/form-data, required)",
						"width":   "Target width (required)",
						"height":  "Target height (required)",
						"quality": "JPEG quality 1-100 (optional, default: 80)",
						"format":  "Output format: jpeg, png, webp (optional, default: jpeg)",
					},
				},
				"GET /health": gin.H{
					"description": "Health check endpoint",
				},
			},
		})
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting Fast Image Resizer & Optimizer on port %s", port)
	log.Printf("Health check: http://localhost:%s/health", port)
	log.Printf("API documentation: http://localhost:%s/", port)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
