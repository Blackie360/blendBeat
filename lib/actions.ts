"use server"

import { revalidatePath } from "next/cache"
import {
  getCurrentUser,
  saveTrack,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  createBlendPlaylist,
} from "./db-actions"
import { getSession } from "./get-session"

const SPOTIFY_API = "https://api.spotify.com/v1"

async function fetchSpotifyAPI(endpoint, options = {}) {
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
    return null
  }

  return res.json()
}

export async function searchTracks(query) {
  if (!query) return []

  const data = await fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=track&limit=10`)

  return data.tracks.items
}

export async function addTrackToPlaylistAction(playlistId, trackUri) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // First, get track details from Spotify
  const trackId = trackUri.split(":")[2]
  const trackData = await fetchSpotifyAPI(`/tracks/${trackId}`)

  // Save track to our database
  const savedTrack = await saveTrack({
    id: trackData.id,
    name: trackData.name,
    artist: trackData.artists.map((a) => a.name).join(", "),
    album: trackData.album?.name,
    duration_ms: trackData.duration_ms,
    spotify_uri: trackData.uri,
    image_url: trackData.album?.images?.[0]?.url,
    preview_url: trackData.preview_url,
  })

  // Add track to playlist in our database
  await addTrackToPlaylist(playlistId, savedTrack.id, user.id)

  // Also add to Spotify
  await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify({
      uris: [trackUri],
    }),
  })

  revalidatePath(`/playlist/${playlistId}`)
}

export async function removeTrackFromPlaylistAction(playlistId, trackUri) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Remove from our database
  await removeTrackFromPlaylist(playlistId, trackUri)

  // Also remove from Spotify
  await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    body: JSON.stringify({
      tracks: [{ uri: trackUri }],
    }),
  })

  revalidatePath(`/playlist/${playlistId}`)
}

export async function getPlaylistCollaborators(playlistId) {
  const session = await getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  // Get playlist details to find the owner
  const playlist = await fetchSpotifyAPI(`/playlists/${playlistId}`)

  // For now, we'll return a mock list of collaborators
  // In a real app, you would need to implement a database to track collaborators
  // since Spotify API doesn't provide this information directly
  return [
    {
      id: playlist.owner.id,
      display_name: playlist.owner.display_name,
      images: playlist.owner.images,
      isOwner: true,
    },
    // Mock collaborators
    {
      id: "user1",
      display_name: "Jane Smith",
      images: [{ url: "/javascript-code-abstract.png" }],
      isOwner: false,
    },
    {
      id: "user2",
      display_name: "Alex Johnson",
      images: [{ url: "/abstract-aj.png" }],
      isOwner: false,
    },
  ]
}

export async function removeCollaborator(playlistId, userId) {
  // In a real app, you would remove the collaborator from your database
  // For this demo, we'll just simulate success
  return { success: true }
}

export async function inviteToPlaylist(playlistId, email) {
  // In a real app, you would send an invitation email and store the invitation in your database
  // For this demo, we'll just simulate success
  return { success: true }
}

export async function createBlendPlaylistAction(name, participantCount) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Create blend in our database
  const result = await createBlendPlaylist(name, participantCount, user.id)

  revalidatePath("/dashboard")
  revalidatePath("/blend")

  return result
}
