import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

const SPOTIFY_API = "https://api.spotify.com/v1"

async function fetchSpotifyAPI(endpoint, options = {}) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new Error("Not authenticated")
  }

  const res = await fetch(`${SPOTIFY_API}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || "Failed to fetch from Spotify API")
  }

  return res.json()
}

export async function getUserProfile(accessToken) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken && !accessToken) {
    throw new Error("Not authenticated")
  }

  const token = accessToken || session?.accessToken

  const res = await fetch(`${SPOTIFY_API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch user profile")
  }

  return res.json()
}

export async function getUserPlaylists(accessToken) {
  const res = await fetch(`${SPOTIFY_API}/me/playlists?limit=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch user playlists")
  }

  const data = await res.json()
  return data.items
}

export async function getPlaylistDetails(playlistId) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    throw new Error("Not authenticated")
  }
  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch playlist details")
  }

  return res.json()
}

export async function createPlaylist(userId, name, description = "", isCollaborative = false) {
  return fetchSpotifyAPI(`/users/${userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      public: true,
      collaborative: isCollaborative,
    }),
  })
}

// New function to create a Spotify playlist with direct access token
export async function createSpotifyPlaylist(accessToken, userId, name, description = "", isCollaborative = false) {
  const res = await fetch(`${SPOTIFY_API}/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: true,
      collaborative: isCollaborative,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || "Failed to create Spotify playlist")
  }

  return res.json()
}

// Add tracks to a Spotify playlist
export async function addTracksToPlaylist(playlistId: string, trackUris: string[]) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    throw new Error("Not authenticated")
  }

  if (!Array.isArray(trackUris)) {
    trackUris = [trackUris]
  }

  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: trackUris,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || "Failed to add tracks to Spotify playlist")
  }

  return res.json()
}

// Remove tracks from a Spotify playlist
export async function removeTracksFromSpotifyPlaylist(accessToken, playlistId, trackUris) {
  if (!Array.isArray(trackUris)) {
    trackUris = [trackUris]
  }

  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tracks: trackUris.map((uri) => ({ uri })),
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || "Failed to remove tracks from Spotify playlist")
  }

  return res.json()
}

// Make a user follow a playlist
export async function followPlaylist(accessToken, playlistId) {
  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/followers`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public: true,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || "Failed to follow playlist")
  }

  return true
}

// Make a user unfollow a playlist
export async function unfollowPlaylist(accessToken, playlistId) {
  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/followers`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || "Failed to unfollow playlist")
  }

  return true
}

// Get Spotify URLs and URIs for a playlist
export function getSpotifyLinks(id: string) {
  return {
    uri: `spotify:playlist:${id}`,
    url: `https://open.spotify.com/playlist/${id}`,
  }
}

export function getSpotifyTrackLinks(id: string) {
  return {
    uri: `spotify:track:${id}`,
    url: `https://open.spotify.com/track/${id}`,
  }
}

// Add the missing searchTracks function
export async function searchTracks(query: string) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new Error("Not authenticated")
  }

  const SPOTIFY_API = "https://api.spotify.com/v1"

  async function fetchSpotifyAPI(endpoint: string, options = {}) {
    const res = await fetch(`${SPOTIFY_API}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error?.message || "Failed to fetch from Spotify API")
    }

    if (res.status === 204) {
      return null
    }

    return res.json()
  }

  if (!query) return []

  const data = await fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=track&limit=10`)

  return data.tracks.items
}

// Get user's top tracks
export async function getUserTopTracks(timeRange = "medium_term", limit = 20) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      throw new Error("Not authenticated")
    }

    const response = await fetch(`${SPOTIFY_API}/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get top tracks")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting top tracks:", error)
    throw error
  }
}

// Get user's top artists
export async function getUserTopArtists(timeRange = "medium_term", limit = 20) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      throw new Error("Not authenticated")
    }

    const response = await fetch(`${SPOTIFY_API}/me/top/artists?time_range=${timeRange}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get top artists")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting top artists:", error)
    throw error
  }
}

// Add the missing getFeaturedPlaylists function
export async function getFeaturedPlaylists(limit = 20, offset = 0, country?: string, locale?: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      throw new Error("Not authenticated")
    }

    let url = `/browse/featured-playlists?limit=${limit}&offset=${offset}`
    if (country) url += `&country=${country}`
    if (locale) url += `&locale=${locale}`

    const response = await fetch(`${SPOTIFY_API}${url}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get featured playlists")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting featured playlists:", error)
    throw error
  }
}

// Add the missing getCategories function
export async function getCategories(limit = 20, offset = 0, country?: string, locale?: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      throw new Error("Not authenticated")
    }

    let url = `/browse/categories?limit=${limit}&offset=${offset}`
    if (country) url += `&country=${country}`
    if (locale) url += `&locale=${locale}`

    const response = await fetch(`${SPOTIFY_API}${url}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get categories")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting categories:", error)
    throw error
  }
}

// Add the missing getCategoryPlaylists function
export async function getCategoryPlaylists(categoryId: string, limit = 20, offset = 0, country?: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      throw new Error("Not authenticated")
    }

    let url = `/browse/categories/${categoryId}/playlists?limit=${limit}&offset=${offset}`
    if (country) url += `&country=${country}`

    const response = await fetch(`${SPOTIFY_API}${url}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get category playlists")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting category playlists:", error)
    throw error
  }
}
