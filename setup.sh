#!/bin/bash

# Setup script for Fast Image Resizer & Optimizer
# This script installs all required dependencies on Ubuntu/Debian

set -e

echo "🚀 Setting up Fast Image Resizer & Optimizer..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root for security reasons"
   exit 1
fi

# Update package list
echo "📦 Updating package list..."
sudo apt-get update

# Install Go
echo "🔧 Installing Go..."
if ! command -v go &> /dev/null; then
    # Download and install Go 1.21
    GO_VERSION="1.21.5"
    GO_ARCH="linux-amd64"
    
    cd /tmp
    wget "https://golang.org/dl/go${GO_VERSION}.${GO_ARCH}.tar.gz"
    sudo tar -C /usr/local -xzf "go${GO_VERSION}.${GO_ARCH}.tar.gz"
    rm "go${GO_VERSION}.${GO_ARCH}.tar.gz"
    
    # Add Go to PATH
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    echo 'export GOPATH=$HOME/go' >> ~/.bashrc
    echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
    
    # Source the changes
    export PATH=$PATH:/usr/local/go/bin
    export GOPATH=$HOME/go
    export PATH=$PATH:$GOPATH/bin
    
    echo "✅ Go installed successfully"
else
    echo "✅ Go is already installed"
fi

# Install libvips
echo "🖼️ Installing libvips..."
sudo apt-get install -y libvips-dev

# Install other build dependencies
echo "🔨 Installing build dependencies..."
sudo apt-get install -y build-essential pkg-config

# Install Docker (optional)
echo "🐳 Installing Docker (optional)..."
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y docker.io
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and back in to use Docker without sudo"
else
    echo "✅ Docker is already installed"
fi

# Install Docker Compose (optional)
echo "🐳 Installing Docker Compose (optional)..."
if ! command -v docker-compose &> /dev/null; then
    sudo apt-get install -y docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose is already installed"
fi

# Build the application
echo "🏗️ Building the application..."
cd "$(dirname "$0")"
go mod tidy
go build -o blendBeat ./cmd/server

echo "✅ Setup complete!"
echo ""
echo "🎉 Fast Image Resizer & Optimizer is ready!"
echo ""
echo "To run the application:"
echo "  ./blendBeat"
echo ""
echo "To run with Docker:"
echo "  docker-compose up --build"
echo ""
echo "To test the API:"
echo "  curl http://localhost:8080/health"
echo ""
echo "For more information, see README.md"
