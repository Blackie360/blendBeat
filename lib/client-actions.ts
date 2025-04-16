"use client"

// Client-side actions that don't directly import server-only functions

export async function revalidatePathClient(path: string) {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    })

    if (!response.ok) {
      throw new Error("Failed to revalidate path")
    }

    return await response.json()
  } catch (error) {
    console.error("Error revalidating path:", error)
    throw error
  }
}

export async function addTrackToPlaylistClient(playlistId: string, track: any) {
  try {
    const response = await fetch("/api/tracks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: track.id,
        name: track.name,
        artist: track.artists?.map((a) => a.name).join(", ") || track.artist,
        album: track.album?.name || track.album,
        duration_ms: track.duration_ms,
        spotify_uri: track.uri || track.spotify_uri,
        image_url: track.album?.images?.[0]?.url || track.image_url,
        preview_url: track.preview_url,
        playlistId,
        trackUri: track.uri || track.spotify_uri, // Pass the track URI for Spotify sync
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add track")
    }

    // Revalidate the playlist page
    await revalidatePathClient(`/playlist/${playlistId}`)

    return await response.json()
  } catch (error) {
    console.error("Add track error:", error)
    throw error
  }
}

export async function removeTrackFromPlaylistClient(playlistId: string, trackId: string, trackUri: string) {
  try {
    const response = await fetch(
      `/api/tracks?playlistId=${playlistId}&trackId=${trackId}&trackUri=${encodeURIComponent(trackUri)}`,
      {
        method: "DELETE",
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to remove track")
    }

    // Revalidate the playlist page
    await revalidatePathClient(`/playlist/${playlistId}`)

    return await response.json()
  } catch (error) {
    console.error("Remove track error:", error)
    throw error
  }
}

export async function addCollaboratorClient(playlistId: string, email: string, role = "editor") {
  try {
    const response = await fetch("/api/collaborators", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlistId,
        email,
        role,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add collaborator")
    }

    // Revalidate the playlist page
    await revalidatePathClient(`/playlist/${playlistId}`)

    return await response.json()
  } catch (error) {
    console.error("Add collaborator error:", error)
    throw error
  }
}

export async function removeCollaboratorClient(playlistId: string, userId: string) {
  try {
    const response = await fetch(`/api/collaborators?playlistId=${playlistId}&userId=${userId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to remove collaborator")
    }

    // Revalidate the playlist page
    await revalidatePathClient(`/playlist/${playlistId}`)

    return await response.json()
  } catch (error) {
    console.error("Remove collaborator error:", error)
    throw error
  }
}

export async function createBlendPlaylistClient(name: string, maxParticipants: number, description?: string) {
  try {
    const response = await fetch("/api/blends", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        maxParticipants,
        description: description || `A collaborative blend playlist with up to ${maxParticipants} participants`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create blend playlist")
    }

    const result = await response.json()

    // Revalidate relevant paths
    await revalidatePathClient("/dashboard")
    await revalidatePathClient("/blend")

    return result
  } catch (error) {
    console.error("Create blend error:", error)
    throw error
  }
}

export async function joinBlendClient(blendId: number) {
  try {
    const response = await fetch(`/api/blends/${blendId}/join`, {
      method: "POST",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to join blend")
    }

    const result = await response.json()

    // Revalidate relevant paths
    await revalidatePathClient("/blend")
    if (result.playlistId) {
      await revalidatePathClient(`/playlist/${result.playlistId}`)
    }

    return result
  } catch (error) {
    console.error("Join blend error:", error)
    throw error
  }
}
