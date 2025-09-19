package cache

import (
	"crypto/md5"
	"fmt"
	"sync"
	"time"
)

// CacheItem represents a cached image
type CacheItem struct {
	Data      []byte
	CreatedAt time.Time
	ExpiresAt time.Time
}

// ImageCache provides in-memory caching for processed images
type ImageCache struct {
	items map[string]*CacheItem
	mutex sync.RWMutex
	ttl   time.Duration
}

// NewImageCache creates a new image cache with the specified TTL
func NewImageCache(ttl time.Duration) *ImageCache {
	cache := &ImageCache{
		items: make(map[string]*CacheItem),
		ttl:   ttl,
	}

	// Start cleanup goroutine
	go cache.cleanup()

	return cache
}

// GenerateKey creates a cache key from the input parameters
func (c *ImageCache) GenerateKey(input []byte, width, height int, quality int, format string) string {
	keyData := fmt.Sprintf("%x-%d-%d-%d-%s", md5.Sum(input), width, height, quality, format)
	return keyData
}

// Get retrieves an item from the cache
func (c *ImageCache) Get(key string) ([]byte, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	item, exists := c.items[key]
	if !exists {
		return nil, false
	}

	// Check if item has expired
	if time.Now().After(item.ExpiresAt) {
		return nil, false
	}

	return item.Data, true
}

// Set stores an item in the cache
func (c *ImageCache) Set(key string, data []byte) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	now := time.Now()
	c.items[key] = &CacheItem{
		Data:      data,
		CreatedAt: now,
		ExpiresAt: now.Add(c.ttl),
	}
}

// Delete removes an item from the cache
func (c *ImageCache) Delete(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	delete(c.items, key)
}

// Clear removes all items from the cache
func (c *ImageCache) Clear() {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	c.items = make(map[string]*CacheItem)
}

// Size returns the number of items in the cache
func (c *ImageCache) Size() int {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	return len(c.items)
}

// cleanup removes expired items from the cache
func (c *ImageCache) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.mutex.Lock()
		now := time.Now()
		for key, item := range c.items {
			if now.After(item.ExpiresAt) {
				delete(c.items, key)
			}
		}
		c.mutex.Unlock()
	}
}
