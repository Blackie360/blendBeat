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

// Playlist Metadata Retrieval
export async function getPlaylistDetails(playlistId: string) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get playlist details")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting playlist details:", error)
    throw error
  }
}

// Playlist Management - Create
export async function createPlaylist(userId: string, name: string, description = "", isPublic = true) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to create playlist")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating playlist:", error)
    throw error
  }
}

// Playlist Management - Add Items
export async function addItemsToPlaylist(playlistId: string, uris: string[]) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to add items to playlist")
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding items to playlist:", error)
    throw error
  }
}

// Playlist Management - Remove Items
export async function removeItemsFromPlaylist(playlistId: string, uris: string[]) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tracks: uris.map((uri) => ({ uri })),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to remove items from playlist")
    }

    return await response.json()
  } catch (error) {
    console.error("Error removing items from playlist:", error)
    throw error
  }
}

// Playlist Management - Reorder Items
export async function reorderPlaylistItems(
  playlistId: string,
  rangeStart: number,
  insertBefore: number,
  rangeLength = 1,
) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range_start: rangeStart,
        insert_before: insertBefore,
        range_length: rangeLength,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to reorder playlist items")
    }

    return await response.json()
  } catch (error) {
    console.error("Error reordering playlist items:", error)
    throw error
  }
}

// Playlist Management - Update Details
export async function updatePlaylistDetails(
  playlistId: string,
  details: { name?: string; description?: string; public?: boolean; collaborative?: boolean },
) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to update playlist details")
    }

    return true
  } catch (error) {
    console.error("Error updating playlist details:", error)
    throw error
  }
}

// Playlist Management - Change Cover Image
export async function uploadPlaylistCoverImage(playlistId: string, base64Image: string) {
  try {
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
      const error = await response.json().catch(() => ({ message: "Failed to upload cover image" }))
      throw new Error(error.error?.message || "Failed to upload cover image")
    }

    return true
  } catch (error) {
    console.error("Error uploading playlist cover image:", error)
    throw error
  }
}

// Collaborative and Follow Features - Follow Playlist
export async function followPlaylist(playlistId: string, isPublic = true) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/followers`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public: isPublic,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to follow playlist")
    }

    return true
  } catch (error) {
    console.error("Error following playlist:", error)
    throw error
  }
}

// Collaborative and Follow Features - Unfollow Playlist
export async function unfollowPlaylist(playlistId: string) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/followers`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to unfollow playlist")
    }

    return true
  } catch (error) {
    console.error("Error unfollowing playlist:", error)
    throw error
  }
}

// Collaborative and Follow Features - Check if Users Follow Playlist
export async function checkUsersFollowPlaylist(playlistId: string, userIds: string[]) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/followers/contains?ids=${userIds.join(",")}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to check if users follow playlist")
    }

    return await response.json()
  } catch (error) {
    console.error("Error checking if users follow playlist:", error)
    throw error
  }
}

// Collaborative and Follow Features - Set Playlist as Collaborative
export async function setPlaylistCollaborative(playlistId: string, collaborative: boolean) {
  try {
    return await updatePlaylistDetails(playlistId, { collaborative })
  } catch (error) {
    console.error("Error setting playlist as collaborative:", error)
    throw error
  }
}

// Search and Browse - Search for Playlists
export async function searchPlaylists(query: string, limit = 20, offset = 0) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(
      `${SPOTIFY_API}/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to search playlists")
    }

    const data = await response.json()
    return data.playlists
  } catch (error) {
    console.error("Error searching playlists:", error)
    throw error
  }
}

// Search and Browse - Get Featured Playlists
export async function getFeaturedPlaylists(limit = 20, offset = 0, country?: string, locale?: string) {
  try {
    const accessToken = await getAccessToken()

    let url = `${SPOTIFY_API}/browse/featured-playlists?limit=${limit}&offset=${offset}`
    if (country) url += `&country=${country}`
    if (locale) url += `&locale=${locale}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

// Search and Browse - Get Categories
export async function getCategories(limit = 20, offset = 0, country?: string, locale?: string) {
  try {
    const accessToken = await getAccessToken()

    let url = `${SPOTIFY_API}/browse/categories?limit=${limit}&offset=${offset}`
    if (country) url += `&country=${country}`
    if (locale) url += `&locale=${locale}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get categories")
    }

    const data = await response.json()
    return data.categories
  } catch (error) {
    console.error("Error getting categories:", error)
    throw error
  }
}

// Search and Browse - Get Category Playlists
export async function getCategoryPlaylists(categoryId: string, limit = 20, offset = 0, country?: string) {
  try {
    const accessToken = await getAccessToken()

    let url = `${SPOTIFY_API}/browse/categories/${categoryId}/playlists?limit=${limit}&offset=${offset}`
    if (country) url += `&country=${country}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to get category playlists")
    }

    const data = await response.json()
    return data.playlists
  } catch (error) {
    console.error("Error getting category playlists:", error)
    throw error
  }
}
