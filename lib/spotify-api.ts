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
  const res = await fetch(`${SPOTIFY_API}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

export async function getPlaylistDetails(accessToken, playlistId) {
  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
