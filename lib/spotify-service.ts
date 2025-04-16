import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const SPOTIFY_API_URL = "https://api.spotify.com/v1"

// Helper function to get access token
async function getAccessToken(userId?: string) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new Error("No access token found")
  }

  return session.accessToken
}

// Create a new Spotify playlist
export async function createSpotifyPlaylist(
  userId: string,
  name: string,
  description: string,
  isCollaborative = false,
) {
  try {
    const accessToken = await getAccessToken(userId)

    const response = await fetch(`${SPOTIFY_API_URL}/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        public: false,
        collaborative: isCollaborative,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Spotify API error:", error)
      throw new Error(`Failed to create playlist: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating Spotify playlist:", error)
    throw error
  }
}

// Get user's playlists
export async function getUserPlaylists(userId: string) {
  try {
    const accessToken = await getAccessToken(userId)

    const response = await fetch(`${SPOTIFY_API_URL}/me/playlists?limit=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Spotify API error:", error)
      throw new Error(`Failed to get playlists: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting user playlists:", error)
    throw error
  }
}

// Get user profile information
export async function getUserProfile(userId?: string) {
  try {
    const accessToken = await getAccessToken(userId)

    const response = await fetch(`${SPOTIFY_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Spotify API error:", error)
      throw new Error(`Failed to get user profile: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Get user's top tracks
export async function getUserTopTracks(userId?: string, timeRange = "medium_term", limit = 20) {
  try {
    const accessToken = await getAccessToken(userId)

    const response = await fetch(`${SPOTIFY_API_URL}/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Spotify API error:", error)
      throw new Error(`Failed to get top tracks: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting user top tracks:", error)
    throw error
  }
}

// Get user's top artists
export async function getUserTopArtists(userId?: string, timeRange = "medium_term", limit = 20) {
  try {
    const accessToken = await getAccessToken(userId)

    const response = await fetch(`${SPOTIFY_API_URL}/me/top/artists?time_range=${timeRange}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Spotify API error:", error)
      throw new Error(`Failed to get top artists: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting user top artists:", error)
    throw error
  }
}

// Get playlist details
export async function getPlaylistDetails(playlistId: string) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${SPOTIFY_API_URL}/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Spotify API error:", error)
      throw new Error(`Failed to get playlist details: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting playlist details:", error)
    throw error
  }
}
