// Client-side wrapper for Spotify API calls

// Helper function to make API requests through our Next.js API routes
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api${endpoint}`, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || `Failed to fetch: ${response.statusText}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// PLAYLIST METADATA RETRIEVAL

// Get a playlist by ID
export async function getPlaylist(playlistId: string) {
  return apiFetch(`/playlists/${playlistId}`)
}

// Get a playlist's tracks
export async function getPlaylistTracks(playlistId: string, offset = 0, limit = 100) {
  return apiFetch(`/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`)
}

// PLAYLIST MANAGEMENT

// Create a playlist
export async function createPlaylist(name: string, description = "", isPublic = true) {
  return apiFetch(`/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, public: isPublic }),
  })
}

// Add tracks to a playlist
export async function addTracksToPlaylist(playlistId: string, uris: string[], position?: number) {
  return apiFetch(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uris, position }),
  })
}

// Remove tracks from a playlist
export async function removeTracksFromPlaylist(playlistId: string, uris: string[]) {
  return apiFetch(`/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uris }),
  })
}

// Reorder tracks in a playlist
export async function reorderPlaylistTracks(
  playlistId: string,
  rangeStart: number,
  insertBefore: number,
  rangeLength = 1,
) {
  return apiFetch(`/playlists/${playlistId}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      range_start: rangeStart,
      insert_before: insertBefore,
      range_length: rangeLength,
    }),
  })
}

// Update a playlist's details
export async function updatePlaylistDetails(
  playlistId: string,
  details: { name?: string; description?: string; public?: boolean; collaborative?: boolean },
) {
  return apiFetch(`/playlists/${playlistId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
}

// Upload a custom playlist cover image
export async function uploadPlaylistCoverImage(playlistId: string, base64Image: string) {
  return apiFetch(`/playlists/${playlistId}/image`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image }),
  })
}

// COLLABORATIVE AND FOLLOW FEATURES

// Follow a playlist
export async function followPlaylist(playlistId: string, isPublic = true) {
  return apiFetch(`/playlists/${playlistId}/follow`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public: isPublic }),
  })
}

// Unfollow a playlist
export async function unfollowPlaylist(playlistId: string) {
  return apiFetch(`/playlists/${playlistId}/follow`, {
    method: "DELETE",
  })
}

// Check if current user follows a playlist
export async function checkFollowingPlaylist(playlistId: string) {
  return apiFetch(`/playlists/${playlistId}/following`)
}

// SEARCH AND BROWSE

// Search for playlists
export async function searchPlaylists(query: string, limit = 20, offset = 0) {
  return apiFetch(`/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}&offset=${offset}`)
}

// Get featured playlists
export async function getFeaturedPlaylists(limit = 20, offset = 0) {
  return apiFetch(`/playlists/featured?limit=${limit}&offset=${offset}`)
}

// Get categories
export async function getCategories(limit = 20, offset = 0) {
  return apiFetch(`/categories?limit=${limit}&offset=${offset}`)
}

// Get a category's playlists
export async function getCategoryPlaylists(categoryId: string, limit = 20, offset = 0) {
  return apiFetch(`/categories/${categoryId}/playlists?limit=${limit}&offset=${offset}`)
}

// Get current user's playlists
export async function getUserPlaylists(limit = 20, offset = 0) {
  return apiFetch(`/me/playlists?limit=${limit}&offset=${offset}`)
}
