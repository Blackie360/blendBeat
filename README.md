# Fast Image Resizer & Optimizer

A high-performance Go-based image resizing and optimization service that can process images from URLs or file uploads, resize them, compress them, and cache the results for optimal performance.

## Features

- **Fast Image Processing**: Uses libvips (via bimg) for high-performance image operations
- **Multiple Input Sources**: Accept images via file upload or remote URL
- **Flexible Resizing**: Resize to specified dimensions while maintaining aspect ratio
- **Format Support**: JPEG, PNG, and WebP output formats
- **Intelligent Caching**: In-memory caching to avoid reprocessing identical requests
- **RESTful API**: Simple HTTP endpoints for easy integration
- **CORS Support**: Ready for web application integration
- **Health Monitoring**: Built-in health check endpoint

## Quick Start

### Prerequisites

- Go 1.21 or later
- libvips development libraries

### Installation

1. **Install libvips** (required for image processing):

   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install libvips-dev
   ```

   **macOS:**
   ```bash
   brew install vips
   ```

   **CentOS/RHEL:**
   ```bash
   sudo yum install vips-devel
   ```

2. **Clone and build:**
   ```bash
   git clone <repository-url>
   cd blendBeat
   go mod tidy
   go build -o blendBeat ./cmd/server
   ```

3. **Run the server:**
   ```bash
   ./blendBeat
   ```

The server will start on port 8080 by default. You can change the port by setting the `PORT` environment variable.

## API Endpoints

### Health Check
```bash
GET /health
```
Returns the health status and cache statistics.

### Resize Image from URL
```bash
GET /resize?url=<image_url>&width=<width>&height=<height>&quality=<quality>&format=<format>
```

**Parameters:**
- `url` (required): URL of the image to resize
- `width` (required): Target width in pixels
- `height` (required): Target height in pixels
- `quality` (optional): JPEG quality 1-100 (default: 80)
- `format` (optional): Output format - jpeg, png, webp (default: jpeg)

**Example:**
```bash
curl "http://localhost:8080/resize?url=https://example.com/image.jpg&width=400&height=300&quality=85&format=jpeg" --output resized.jpg
```

### Resize Uploaded Image
```bash
POST /resize
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (required): Image file
- `width` (required): Target width in pixels
- `height` (required): Target height in pixels
- `quality` (optional): JPEG quality 1-100 (default: 80)
- `format` (optional): Output format - jpeg, png, webp (default: jpeg)

**Example:**
```bash
curl -X POST -F "image=@/path/to/image.jpg" -F "width=400" -F "height=300" -F "quality=85" -F "format=jpeg" http://localhost:8080/resize --output resized.jpg
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 8080)
- `GIN_MODE`: Gin framework mode (debug, release, test)

### Cache Configuration

The cache TTL (Time To Live) is currently set to 1 hour. You can modify this in `cmd/server/main.go`:

```go
imageCache := cache.NewImageCache(1 * time.Hour) // Change this value
```

## Architecture

```
[Client] ---> [HTTP Server (Gin)] ---> [Image Processor (bimg)] ---> [Cache] ---> [Response]
```

### Components

- **HTTP Server**: Gin-based REST API server
- **Image Processor**: Handles image resizing and compression using libvips
- **Cache**: In-memory cache for processed images
- **Handler**: HTTP request/response handling and validation

## Performance

- **High Throughput**: libvips provides excellent performance for image processing
- **Memory Efficient**: Streaming processing for large images
- **Caching**: Reduces processing time for repeated requests
- **Concurrent**: Handles multiple requests simultaneously

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful image processing
- `400 Bad Request`: Invalid parameters or malformed request
- `500 Internal Server Error`: Image processing failed

Error responses include descriptive error messages:

```json
{
  "error": "Width and height must be positive integers"
}
```

## Development

### Project Structure

```
blendBeat/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── handler/
│   │   └── image_handler.go # HTTP request handlers
│   ├── processor/
│   │   └── image_processor.go # Image processing logic
│   └── cache/
│       └── cache.go         # Caching implementation
├── go.mod                   # Go module definition
└── README.md               # This file
```

### Building

```bash
# Build for current platform
go build -o blendBeat ./cmd/server

# Build for Linux (from macOS/Windows)
GOOS=linux GOARCH=amd64 go build -o blendBeat-linux ./cmd/server

# Build with optimizations
go build -ldflags="-s -w" -o blendBeat ./cmd/server
```

### Testing

```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...
```

## Deployment

### Docker

Create a `Dockerfile`:

```dockerfile
FROM golang:1.21-alpine AS builder

# Install libvips
RUN apk add --no-cache vips-dev

WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o blendBeat ./cmd/server

FROM alpine:latest
RUN apk add --no-cache vips
COPY --from=builder /app/blendBeat /blendBeat
EXPOSE 8080
CMD ["/blendBeat"]
```

### Cloud Deployment

The application is stateless and can be deployed to any cloud platform:

- **AWS**: EC2, ECS, Lambda (with custom runtime)
- **Google Cloud**: Cloud Run, Compute Engine
- **Azure**: Container Instances, App Service
- **Heroku**: Direct deployment with buildpack

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.
