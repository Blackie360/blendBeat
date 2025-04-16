import { getSession } from "./get-session"
import { saveTrack, savePlaylist, getCurrentUser } from "./db-service"
import { v4 as uuidv4 } from "uuid"

const SPOTIFY_API = "https://api.spotify.com/v1"

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

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images: { url: string; height: number; width: number }[]
}

// Helper function to fetch from Spotify API
async function fetchSpotifyAPI<T>(endpoint: string, options = {}): Promise<T> {
  const session = await getSession()

  if (!session?.accessToken) {
    throw new Error("Not authenticated")
  }

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
    return null as T
  }

  return res.json()
}

// User profile
export async function getUserProfile(): Promise<SpotifyUser> {
  return fetchSpotifyAPI<SpotifyUser>("/me")
}

// Playlist operations
export async function getUserPlaylists(accessToken, limit = 50): Promise<SpotifyPlaylist[]> {
  try {
    const res = await fetch(`${SPOTIFY_API}/me/playlists?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error("Spotify API error:", errorData)

      // If unauthorized, throw a specific error
      if (res.status === 401) {
        throw new Error("Spotify authorization expired. Please log in again.")
      }

      throw new Error(`Failed to fetch user playlists: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    return data.items || []
  } catch (error) {
    console.error("Error in getUserPlaylists:", error)
    // Return empty array instead of throwing to prevent complete UI failure
    return []
  }
}

export async function getPlaylistDetails(playlistId: string): Promise<SpotifyPlaylist> {
  return fetchSpotifyAPI<SpotifyPlaylist>(`/playlists/${playlistId}`)
}

export async function createSpotifyPlaylist(
  name: string,
  description = "",
  isCollaborative = false,
  isPublic = true,
): Promise<SpotifyPlaylist> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("User not found")
  }

  const playlist = await fetchSpotifyAPI<SpotifyPlaylist>(`/users/${user.spotify_id}/playlists`, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      public: isPublic,
      collaborative: isCollaborative,
    }),
  })

  // Save to our database
  await savePlaylist({
    name: playlist.name,
    description: playlist.description,
    image_url: playlist.images[0]?.url,
    spotify_id: playlist.id,
    owner_id: user.id,
    is_collaborative: playlist.collaborative,
    is_public: playlist.public,
  })

  return playlist
}

// Track operations
export async function searchTracks(query: string, limit = 10): Promise<SpotifyTrack[]> {
  if (!query) return []

  const data = await fetchSpotifyAPI<{ tracks: { items: SpotifyTrack[] } }>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
  )

  return data.tracks.items
}

export async function addTrackToPlaylist(playlistId: string, trackUri: string): Promise<void> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // First, get track details from Spotify
  const trackId = trackUri.split(":")[2]
  const trackData = await fetchSpotifyAPI<SpotifyTrack>(`/tracks/${trackId}`)

  // Save track to our database
  const savedTrack = await saveTrack({
    id: uuidv4(),
    name: trackData.name,
    artist: trackData.artists.map((a) => a.name).join(", "),
    album: trackData.album?.name,
    duration_ms: trackData.duration_ms,
    spotify_uri: trackData.uri,
    image_url: trackData.album?.images?.[0]?.url,
    preview_url: trackData.preview_url,
  })

  // Add to Spotify
  await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify({
      uris: [trackUri],
    }),
  })
}

export async function removeTrackFromPlaylist(playlistId: string, trackUri: string): Promise<void> {
  await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    body: JSON.stringify({
      tracks: [{ uri: trackUri }],
    }),
  })
}

// Recommendations
export async function getRecommendations(
  seedTracks: string[] = [],
  seedArtists: string[] = [],
  seedGenres: string[] = [],
  limit = 10,
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams()

  if (seedTracks.length) params.append("seed_tracks", seedTracks.join(","))
  if (seedArtists.length) params.append("seed_artists", seedArtists.join(","))
  if (seedGenres.length) params.append("seed_genres", seedGenres.join(","))
  params.append("limit", limit.toString())

  const data = await fetchSpotifyAPI<{ tracks: SpotifyTrack[] }>(`/recommendations?${params.toString()}`)
  return data.tracks
}

// User's top items
export async function getUserTopTracks(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 10,
): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyAPI<{ items: SpotifyTrack[] }>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`)
  return data.items
}

export async function getUserTopArtists(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 10,
) {
  const data = await fetchSpotifyAPI<{ items: any[] }>(`/me/top/artists?time_range=${timeRange}&limit=${limit}`)
  return data.items
}

// Recently played
export async function getRecentlyPlayed(limit = 10) {
  const data = await fetchSpotifyAPI<{ items: any[] }>(`/me/player/recently-played?limit=${limit}`)
  return data.items
}
