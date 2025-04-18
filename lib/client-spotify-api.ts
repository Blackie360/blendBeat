// Client-side wrappers for Spotify API functions

// Playlist Metadata Retrieval
export async function getPlaylistDetails(playlistId: string) {
  try {
    const response = await fetch(`/api/playlists/${playlistId}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to get playlist details")
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting playlist details:", error)
    throw error
  }
}

// Playlist Management - Create
export async function createPlaylist(name: string, description = "", isPublic = true) {
  try {
    const response = await fetch(`/api/playlists`, {
      method: "POST",
      headers: {
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
      throw new Error(error.message || "Failed to create playlist")
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
    const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add items to playlist")
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
    const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to remove items from playlist")
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
    const response = await fetch(`/api/playlists/${playlistId}/reorder`, {
      method: "PUT",
      headers: {
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
      throw new Error(error.message || "Failed to reorder playlist items")
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
    const response = await fetch(`/api/playlists/${playlistId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update playlist details")
    }
    return await response.json()
  } catch (error) {
    console.error("Error updating playlist details:", error)
    throw error
  }
}

// Playlist Management - Change Cover Image
export async function uploadPlaylistCoverImage(playlistId: string, imageFile: File) {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile)

    const response = await fetch(`/api/playlists/${playlistId}/image`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to upload cover image")
    }
    return await response.json()
  } catch (error) {
    console.error("Error uploading playlist cover image:", error)
    throw error
  }
}

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Collaborative and Follow Features - Follow Playlist
export async function followPlaylist(playlistId: string, isPublic = true) {
  try {
    const response = await fetch(`/api/playlists/${playlistId}/follow`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public: isPublic,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to follow playlist")
    }
    return await response.json()
  } catch (error) {
    console.error("Error following playlist:", error)
    throw error
  }
}

// Collaborative and Follow Features - Unfollow Playlist
export async function unfollowPlaylist(playlistId: string) {
  try {
    const response = await fetch(`/api/playlists/${playlistId}/follow`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to unfollow playlist")
    }
    return await response.json()
  } catch (error) {
    console.error("Error unfollowing playlist:", error)
    throw error
  }
}

// Collaborative and Follow Features - Check if Current User Follows Playlist
export async function checkIfUserFollowsPlaylist(playlistId: string) {
  try {
    const response = await fetch(`/api/playlists/${playlistId}/follow`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to check if user follows playlist")
    }
    return await response.json()
  } catch (error) {
    console.error("Error checking if user follows playlist:", error)
    throw error
  }
}

// Search and Browse - Search for Playlists
export async function searchPlaylists(query: string, limit = 20, offset = 0) {
  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}&offset=${offset}`,
    )
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to search playlists")
    }
    return await response.json()
  } catch (error) {
    console.error("Error searching playlists:", error)
    throw error
  }
}

// Search and Browse - Get Featured Playlists
export async function getFeaturedPlaylists(limit = 20, offset = 0) {
  try {
    const response = await fetch(`/api/playlists/featured?limit=${limit}&offset=${offset}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to get featured playlists")
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting featured playlists:", error)
    throw error
  }
}

// Search and Browse - Get Categories
export async function getCategories(limit = 20, offset = 0) {
  try {
    const response = await fetch(`/api/categories?limit=${limit}&offset=${offset}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to get categories")
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting categories:", error)
    throw error
  }
}

// Search and Browse - Get Category Playlists
export async function getCategoryPlaylists(categoryId: string, limit = 20, offset = 0) {
  try {
    const response = await fetch(`/api/categories/${categoryId}/playlists?limit=${limit}&offset=${offset}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to get category playlists")
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting category playlists:", error)
    throw error
  }
}
