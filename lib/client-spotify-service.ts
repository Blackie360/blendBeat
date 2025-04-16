"use client"

// Types for Spotify API responses
export interface SpotifyTrack {
  id: string
  name: string
  uri: string
  duration_ms: number
  preview_url: string | null
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; height: number; width: number }[]
  }
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  collaborative: boolean
  public: boolean
  images: { url: string; height: number; width: number }[]
  owner: {
    id: string
    display_name: string
  }
  tracks: {
    total: number
    items: {
      track: SpotifyTrack
      added_at: string
      added_by: {
        id: string
        display_name: string
      }
    }[]
  }
}

// Client-side search function
export async function searchTracksClient(query: string): Promise<SpotifyTrack[]> {
  if (!query) return []

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error("Failed to search tracks")
    }

    return await response.json()
  } catch (error) {
    console.error("Search error:", error)
    throw error
  }
}

// Client-side add track function
export async function addTrackToPlaylistClient(playlistId: string, track: SpotifyTrack): Promise<void> {
  try {
    const response = await fetch("/api/tracks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: track.id,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album?.name,
        duration_ms: track.duration_ms,
        spotify_uri: track.uri,
        image_url: track.album?.images?.[0]?.url,
        preview_url: track.preview_url,
        playlistId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add track")
    }
  } catch (error) {
    console.error("Add track error:", error)
    throw error
  }
}

// Client-side remove track function
export async function removeTrackFromPlaylistClient(playlistId: string, trackId: string): Promise<void> {
  try {
    const response = await fetch(`/api/tracks?playlistId=${playlistId}&trackId=${trackId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to remove track")
    }
  } catch (error) {
    console.error("Remove track error:", error)
    throw error
  }
}
