# Quick Start Guide

## Prerequisites

- Ubuntu 24.04 LTS (or similar Debian-based system)
- Internet connection
- Basic command line knowledge

## One-Command Setup

Run the setup script to install all dependencies and build the application:

```bash
./setup.sh
```

This script will:
- Install Go 1.21
- Install libvips (required for image processing)
- Install Docker and Docker Compose (optional)
- Build the application
- Set up your environment

## Manual Setup

If you prefer to install dependencies manually:

### 1. Install Go
```bash
# Download and install Go 1.21
wget https://golang.org/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# Add to PATH
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
source ~/.bashrc
```

### 2. Install libvips
```bash
sudo apt-get update
sudo apt-get install -y libvips-dev build-essential pkg-config
```

### 3. Build and Run
```bash
# Install dependencies
go mod tidy

# Build the application
go build -o blendBeat ./cmd/server

# Run the application
./blendBeat
```

## Testing the Application

### 1. Check Health
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "cache_size": 0
}
```

### 2. Resize Image from URL
```bash
curl "http://localhost:8080/resize?url=https://picsum.photos/800/600&width=400&height=300&quality=85&format=jpeg" --output resized.jpg
```

### 3. Resize Uploaded Image
```bash
curl -X POST -F "image=@/path/to/your/image.jpg" -F "width=400" -F "height=300" -F "quality=85" -F "format=jpeg" http://localhost:8080/resize --output resized.jpg
```

## Using Docker

### Build and Run with Docker Compose
```bash
docker-compose up --build
```

### Build Docker Image Manually
```bash
docker build -t blendbeat .
docker run -p 8080:8080 blendbeat
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/resize` | Resize image from URL |
| POST | `/resize` | Resize uploaded image |
| GET | `/` | API documentation |

## Example Usage

### Resize from URL
```bash
curl "http://localhost:8080/resize?url=https://example.com/image.jpg&width=400&height=300" --output output.jpg
```

### Upload and Resize
```bash
curl -X POST \
  -F "image=@input.jpg" \
  -F "width=400" \
  -F "height=300" \
  -F "quality=90" \
  -F "format=webp" \
  http://localhost:8080/resize \
  --output output.webp
```

## Troubleshooting

### Go not found
If you get "go: command not found", run:
```bash
source ~/.bashrc
```

### libvips not found
If you get libvips errors, install it:
```bash
sudo apt-get install libvips-dev
```

### Permission denied
Make sure the setup script is executable:
```bash
chmod +x setup.sh
```

### Port already in use
Change the port:
```bash
PORT=8081 ./blendBeat
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check the [API documentation](http://localhost:8080/) when the server is running
- Explore the source code in the `internal/` directory
- Customize the cache settings in `cmd/server/main.go`
