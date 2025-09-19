package processor

import (
	"fmt"
	"gopkg.in/h2non/bimg.v1"
)

// ImageProcessor handles image processing operations
type ImageProcessor struct{}

// NewImageProcessor creates a new image processor instance
func NewImageProcessor() *ImageProcessor {
	return &ImageProcessor{}
}

// ResizeOptions contains options for image resizing
type ResizeOptions struct {
	Width   int
	Height  int
	Quality int
	Format  string // "jpeg", "png", "webp"
}

// ResizeImage resizes and compresses an image
func (p *ImageProcessor) ResizeImage(input []byte, options ResizeOptions) ([]byte, error) {
	// Validate input
	if len(input) == 0 {
		return nil, fmt.Errorf("input image is empty")
	}

	// Set default quality if not specified
	if options.Quality == 0 {
		options.Quality = 80
	}

	// Set default format if not specified
	if options.Format == "" {
		options.Format = "jpeg"
	}

	// Create bimg options
	bimgOptions := bimg.Options{
		Width:   options.Width,
		Height:  options.Height,
		Quality: options.Quality,
	}

	// Set output format
	switch options.Format {
	case "jpeg", "jpg":
		bimgOptions.Type = bimg.JPEG
	case "png":
		bimgOptions.Type = bimg.PNG
	case "webp":
		bimgOptions.Type = bimg.WEBP
	default:
		return nil, fmt.Errorf("unsupported format: %s", options.Format)
	}

	// Process the image
	processed, err := bimg.NewImage(input).Process(bimgOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to process image: %w", err)
	}

	return processed, nil
}

// GetImageInfo extracts metadata from an image
func (p *ImageProcessor) GetImageInfo(input []byte) (*bimg.ImageMetadata, error) {
	image := bimg.NewImage(input)
	metadata, err := image.Metadata()
	if err != nil {
		return nil, fmt.Errorf("failed to get image metadata: %w", err)
	}
	return metadata, nil
}

// ValidateImage checks if the input is a valid image
func (p *ImageProcessor) ValidateImage(input []byte) error {
	if len(input) == 0 {
		return fmt.Errorf("image is empty")
	}

	// Try to get metadata to validate the image
	_, err := p.GetImageInfo(input)
	if err != nil {
		return fmt.Errorf("invalid image format: %w", err)
	}

	return nil
}
