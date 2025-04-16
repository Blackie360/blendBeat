"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { revalidatePath } from "next/cache"

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

export async function addTrackToPlaylist(playlistId, trackUri) {
  await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify({
      uris: [trackUri],
    }),
  })

  revalidatePath(`/playlist/${playlistId}`)
}

export async function removeTrackFromPlaylist(playlistId, trackUri) {
  await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    body: JSON.stringify({
      tracks: [{ uri: trackUri }],
    }),
  })

  revalidatePath(`/playlist/${playlistId}`)
}

export async function getPlaylistCollaborators(playlistId) {
  const session = await getServerSession(authOptions)

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

export async function createBlendPlaylist(name, participantCount) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not authenticated")
  }

  // Get user profile
  const userProfile = await fetchSpotifyAPI("/me")

  // Create a new collaborative playlist
  const playlist = await fetchSpotifyAPI(`/users/${userProfile.id}/playlists`, {
    method: "POST",
    body: JSON.stringify({
      name: `${name} (Blend)`,
      description: `A collaborative blend playlist with ${participantCount} participants`,
      public: true,
      collaborative: true,
    }),
  })

  // In a real app, you would:
  // 1. Store the blend in your database
  // 2. Match with random users based on music taste
  // 3. Send invitations to those users

  revalidatePath("/dashboard")

  return { playlistId: playlist.id }
}
