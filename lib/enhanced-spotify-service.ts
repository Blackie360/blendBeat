import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

const SPOTIFY_API = "https://api.spotify.com/v1"

// Helper function to get access token
async function getAccessToken() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new Error("No access token found")
  }

  return session.accessToken
}

// Helper function to make API requests
async function spotifyFetch(endpoint: string, options: RequestInit = {}) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${SPOTIFY_API}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Failed to fetch: ${response.statusText}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// PLAYLIST METADATA RETRIEVAL

// Get a playlist by ID
export async function getPlaylist(playlistId: string) {
  return spotifyFetch(`/playlists/${playlistId}`)
}

// Get a playlist's tracks
export async function getPlaylistTracks(playlistId: string, offset = 0, limit = 100) {
  return spotifyFetch(`/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`)
}

// PLAYLIST MANAGEMENT

// Create a playlist
export async function createPlaylist(userId: string, name: string, description = "", isPublic = true) {
  return spotifyFetch(`/users/${userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      public: isPublic,
    }),
  })
}

// Add tracks to a playlist
export async function addTracksToPlaylist(playlistId: string, uris: string[], position?: number) {
  const body: { uris: string[]; position?: number } = { uris }
  if (position !== undefined) {
    body.position = position
  }

  return spotifyFetch(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// Remove tracks from a playlist
export async function removeTracksFromPlaylist(playlistId: string, uris: string[]) {
  return spotifyFetch(`/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    body: JSON.stringify({
      tracks: uris.map((uri) => ({ uri })),
    }),
  })
}

// Reorder tracks in a playlist
export async function reorderPlaylistTracks(
  playlistId: string,
  rangeStart: number,
  insertBefore: number,
  rangeLength = 1,
) {
  return spotifyFetch(`/playlists/${playlistId}/tracks`, {
    method: "PUT",
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
  return spotifyFetch(`/playlists/${playlistId}`, {
    method: "PUT",
    body: JSON.stringify(details),
  })
}

// Upload a custom playlist cover image
export async function uploadPlaylistCoverImage(playlistId: string, base64Image: string) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/images`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "image/jpeg",
    },
    body: base64Image.replace(/^data:image\/jpeg;base64,/, ""),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Failed to upload image: ${response.statusText}`)
  }

  return true
}

// COLLABORATIVE AND FOLLOW FEATURES

// Follow a playlist
export async function followPlaylist(playlistId: string, isPublic = true) {
  return spotifyFetch(`/playlists/${playlistId}/followers`, {
    method: "PUT",
    body: JSON.stringify({ public: isPublic }),
  })
}

// Unfollow a playlist
export async function unfollowPlaylist(playlistId: string) {
  return spotifyFetch(`/playlists/${playlistId}/followers`, {
    method: "DELETE",
  })
}

// Check if users follow a playlist
export async function checkUsersFollowPlaylist(playlistId: string, userIds: string[]) {
  return spotifyFetch(`/playlists/${playlistId}/followers/contains?ids=${userIds.join(",")}`)
}

// Make a playlist collaborative
export async function makePlaylistCollaborative(playlistId: string, collaborative = true) {
  return updatePlaylistDetails(playlistId, { collaborative })
}

// SEARCH AND BROWSE

// Search for playlists
export async function searchPlaylists(query: string, limit = 20, offset = 0) {
  return spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}&offset=${offset}`)
}

// Get featured playlists
export async function getFeaturedPlaylists(limit = 20, offset = 0, country?: string, locale?: string) {
  let url = `/browse/featured-playlists?limit=${limit}&offset=${offset}`

  if (country) url += `&country=${country}`
  if (locale) url += `&locale=${locale}`

  return spotifyFetch(url)
}

// Get categories
export async function getCategories(limit = 20, offset = 0, country?: string, locale?: string) {
  let url = `/browse/categories?limit=${limit}&offset=${offset}`

  if (country) url += `&country=${country}`
  if (locale) url += `&locale=${locale}`

  return spotifyFetch(url)
}

// Get a category's playlists
export async function getCategoryPlaylists(categoryId: string, limit = 20, offset = 0, country?: string) {
  let url = `/browse/categories/${categoryId}/playlists?limit=${limit}&offset=${offset}`

  if (country) url += `&country=${country}`

  return spotifyFetch(url)
}

// Get a user's playlists
export async function getUserPlaylists(limit = 20, offset = 0) {
  return spotifyFetch(`/me/playlists?limit=${limit}&offset=${offset}`)
}

// Get a specific user's public playlists
export async function getUserPublicPlaylists(userId: string, limit = 20, offset = 0) {
  return spotifyFetch(`/users/${userId}/playlists?limit=${limit}&offset=${offset}`)
}
