"use server"

import { executeQuery } from "./db"
import { getSession } from "./get-session"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import {
  getUserProfile,
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist,
  removeTracksFromSpotifyPlaylist,
} from "./spotify"

// User actions
export async function createOrUpdateUser(userData: {
  id: string
  email: string
  name: string
  image?: string
  spotify_id: string
}) {
  try {
    const { id, email, name, image, spotify_id } = userData

    const query = `
      INSERT INTO users (id, email, name, image, spotify_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET 
        email = $2,
        name = $3,
        image = $4,
        spotify_id = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    const result = await executeQuery(query, [id, email, name, image || null, spotify_id])
    return result[0]
  } catch (error) {
    console.error("Error creating or updating user:", error)
    throw error
  }
}

export async function getUserById(id: string) {
  try {
    const query = "SELECT * FROM users WHERE id = $1"
    const result = await executeQuery(query, [id])
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw error
  }
}

// Playlist actions
export async function savePlaylist(playlistData: {
  name: string
  description?: string
  image_url?: string
  spotify_id: string
  owner_id: string
  is_collaborative?: boolean
  is_public?: boolean
}) {
  try {
    const {
      name,
      description,
      image_url,
      spotify_id,
      owner_id,
      is_collaborative = false,
      is_public = true,
    } = playlistData

    const query = `
      INSERT INTO playlists (
        id, name, description, image_url, spotify_id, owner_id, 
        is_collaborative, is_public, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (spotify_id) 
      DO UPDATE SET 
        name = $2,
        description = $3,
        image_url = $4,
        owner_id = $6,
        is_collaborative = $7,
        is_public = $8,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    const id = uuidv4()
    const result = await executeQuery(query, [
      id,
      name,
      description || null,
      image_url || null,
      spotify_id,
      owner_id,
      is_collaborative,
      is_public,
    ])

    return result[0]
  } catch (error) {
    console.error("Error saving playlist:", error)
    throw error
  }
}

export async function getUserPlaylists(userId: string) {
  try {
    const query = `
      SELECT p.* FROM playlists p
      LEFT JOIN collaborators c ON p.id = c.playlist_id
      WHERE p.owner_id = $1 OR c.user_id = $1
      ORDER BY p.updated_at DESC
    `

    return await executeQuery(query, [userId])
  } catch (error) {
    console.error("Error getting user playlists:", error)
    throw error
  }
}

export async function getPlaylistById(playlistId: string) {
  try {
    const query = "SELECT * FROM playlists WHERE id = $1 OR spotify_id = $1"
    const result = await executeQuery(query, [playlistId])
    return result[0] || null
  } catch (error) {
    console.error("Error getting playlist by ID:", error)
    throw error
  }
}

// Track actions
export async function saveTrack(trackData: {
  id: string
  name: string
  artist: string
  album?: string
  duration_ms?: number
  spotify_uri: string
  image_url?: string
  preview_url?: string
}) {
  try {
    const { id, name, artist, album, duration_ms, spotify_uri, image_url, preview_url } = trackData

    const query = `
      INSERT INTO tracks (
        id, name, artist, album, duration_ms, spotify_uri, image_url, preview_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (spotify_uri) 
      DO UPDATE SET 
        name = $2,
        artist = $3,
        album = $4,
        duration_ms = $5,
        image_url = $7,
        preview_url = $8
      RETURNING *
    `

    const result = await executeQuery(query, [
      id,
      name,
      artist,
      album || null,
      duration_ms || null,
      spotify_uri,
      image_url || null,
      preview_url || null,
    ])

    return result[0]
  } catch (error) {
    console.error("Error saving track:", error)
    throw error
  }
}

// Update the addTrackToPlaylist function to sync with Spotify
export async function addTrackToPlaylist(playlistId: string, trackId: string, userId: string, trackUri?: string) {
  try {
    // Add track to our database
    const query = `
      INSERT INTO playlist_tracks (playlist_id, track_id, added_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (playlist_id, track_id) DO NOTHING
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, trackId, userId])

    // Get the playlist to check if it has a Spotify ID
    const playlist = await getPlaylistById(playlistId)

    // If the playlist has a Spotify ID and we have a track URI, add it to Spotify
    if (playlist?.spotify_id && trackUri) {
      try {
        const session = await getSession()
        if (session?.accessToken) {
          await addTracksToSpotifyPlaylist(session.accessToken, playlist.spotify_id, trackUri)
        }
      } catch (spotifyError) {
        console.error("Error adding track to Spotify playlist:", spotifyError)
        // Continue even if Spotify sync fails
      }
    }

    revalidatePath(`/playlist/${playlistId}`)
    return result[0]
  } catch (error) {
    console.error("Error adding track to playlist:", error)
    throw error
  }
}

// Update the removeTrackFromPlaylist function to sync with Spotify
export async function removeTrackFromPlaylist(playlistId: string, trackId: string, trackUri?: string) {
  try {
    // Remove track from our database
    const query = `
      DELETE FROM playlist_tracks
      WHERE playlist_id = $1 AND track_id = $2
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, trackId])

    // Get the playlist to check if it has a Spotify ID
    const playlist = await getPlaylistById(playlistId)

    // If the playlist has a Spotify ID and we have a track URI, remove it from Spotify
    if (playlist?.spotify_id && trackUri) {
      try {
        const session = await getSession()
        if (session?.accessToken) {
          await removeTracksFromSpotifyPlaylist(session.accessToken, playlist.spotify_id, trackUri)
        }
      } catch (spotifyError) {
        console.error("Error removing track from Spotify playlist:", spotifyError)
        // Continue even if Spotify sync fails
      }
    }

    revalidatePath(`/playlist/${playlistId}`)
    return result[0]
  } catch (error) {
    console.error("Error removing track from playlist:", error)
    throw error
  }
}

export async function getPlaylistTracks(playlistId: string) {
  try {
    const query = `
      SELECT t.*, pt.added_at, pt.added_by, u.name as added_by_name
      FROM playlist_tracks pt
      JOIN tracks t ON pt.track_id = t.id
      LEFT JOIN users u ON pt.added_by = u.id
      WHERE pt.playlist_id = $1
      ORDER BY pt.added_at DESC
    `

    return await executeQuery(query, [playlistId])
  } catch (error) {
    console.error("Error getting playlist tracks:", error)
    throw error
  }
}

// Collaborator actions
export async function addCollaborator(playlistId: string, userId: string, role = "editor") {
  try {
    const query = `
      INSERT INTO collaborators (playlist_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (playlist_id, user_id) 
      DO UPDATE SET role = $3
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, userId, role])
    revalidatePath(`/playlist/${playlistId}`)
    return result[0]
  } catch (error) {
    console.error("Error adding collaborator:", error)
    throw error
  }
}

export async function removeCollaborator(playlistId: string, userId: string) {
  try {
    const query = `
      DELETE FROM collaborators
      WHERE playlist_id = $1 AND user_id = $2
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, userId])
    revalidatePath(`/playlist/${playlistId}`)
    return result[0]
  } catch (error) {
    console.error("Error removing collaborator:", error)
    throw error
  }
}

export async function getPlaylistCollaborators(playlistId: string) {
  try {
    const query = `
      SELECT c.*, u.name, u.email, u.image, u.spotify_id,
             p.owner_id = u.id as is_owner
      FROM collaborators c
      JOIN users u ON c.user_id = u.id
      JOIN playlists p ON c.playlist_id = p.id
      WHERE c.playlist_id = $1
      
      UNION
      
      SELECT 
        NULL as id, 
        p.id as playlist_id, 
        u.id as user_id, 
        'owner' as role, 
        p.created_at as joined_at,
        u.name, 
        u.email, 
        u.image, 
        u.spotify_id,
        TRUE as is_owner
      FROM playlists p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
      
      ORDER BY is_owner DESC, joined_at ASC
    `

    return await executeQuery(query, [playlistId])
  } catch (error) {
    console.error("Error getting playlist collaborators:", error)
    throw error
  }
}

// Blend actions
// Update the createBlendPlaylist function to create a Spotify playlist
export async function createBlendPlaylist(name: string, maxParticipants: number, userId: string) {
  try {
    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Get the user's session to access Spotify
      const session = await getSession()
      let spotifyPlaylistId = null
      let playlistId = null

      // Create a Spotify playlist if the user is authenticated
      if (session?.accessToken && session?.user?.id) {
        try {
          // Get the user's Spotify ID
          const userProfile = await getUserProfile(session.accessToken)

          // Create a playlist in Spotify
          const description = `A collaborative blend playlist with up to ${maxParticipants} participants`
          const spotifyPlaylist = await createSpotifyPlaylist(
            session.accessToken,
            userProfile.id,
            `${name} (Blend)`,
            description,
            true, // collaborative
          )

          spotifyPlaylistId = spotifyPlaylist.id

          // Create a playlist in our database linked to the Spotify playlist
          const playlistQuery = `
            INSERT INTO playlists (
              id, name, description, owner_id, is_collaborative, is_public, spotify_id, updated_at
            )
            VALUES (
              uuid_generate_v4(), $1, $2, $3, true, true, $4, CURRENT_TIMESTAMP
            )
            RETURNING *
          `

          const playlist = await executeQuery(playlistQuery, [
            `${name} (Blend)`,
            description,
            userId,
            spotifyPlaylistId,
          ])

          playlistId = playlist[0].id
        } catch (spotifyError) {
          console.error("Error creating Spotify playlist:", spotifyError)
          // Continue without Spotify integration if it fails
        }
      }

      // If Spotify integration failed or wasn't attempted, create a local playlist
      if (!playlistId) {
        const playlistQuery = `
          INSERT INTO playlists (
            id, name, description, owner_id, is_collaborative, is_public, updated_at
          )
          VALUES (
            uuid_generate_v4(), $1, $2, $3, true, true, CURRENT_TIMESTAMP
          )
          RETURNING *
        `

        const description = `A collaborative blend playlist with up to ${maxParticipants} participants`
        const playlist = await executeQuery(playlistQuery, [`${name} (Blend)`, description, userId])

        playlistId = playlist[0].id
      }

      // Create a blend record
      const blendQuery = `
        INSERT INTO blends (
          name, playlist_id, max_participants, is_active, 
          created_at, expires_at
        )
        VALUES (
          $1, $2, $3, true, CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP + INTERVAL '30 days'
        )
        RETURNING *
      `

      const blend = await executeQuery(blendQuery, [name, playlistId, maxParticipants])

      // Add the creator as a participant
      const participantQuery = `
        INSERT INTO blend_participants (blend_id, user_id)
        VALUES ($1, $2)
        RETURNING *
      `

      await executeQuery(participantQuery, [blend[0].id, userId])

      // Commit the transaction
      await executeQuery("COMMIT")

      revalidatePath("/dashboard")
      revalidatePath("/blend")

      return {
        playlistId: playlistId,
        blendId: blend[0].id,
        spotifyPlaylistId: spotifyPlaylistId,
      }
    } catch (error) {
      // Rollback the transaction on error
      await executeQuery("ROLLBACK")
      console.error("Error creating blend playlist:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in createBlendPlaylist:", error)
    throw error
  }
}

export async function getActiveBlends() {
  try {
    const query = `
      SELECT b.*, p.name as playlist_name, p.id as playlist_id,
             COUNT(bp.id) as current_participants
      FROM blends b
      JOIN playlists p ON b.playlist_id = p.id
      LEFT JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE b.is_active = true AND b.expires_at > CURRENT_TIMESTAMP
      GROUP BY b.id, p.name, p.id
      ORDER BY b.created_at DESC
    `

    return await executeQuery(query)
  } catch (error) {
    console.error("Error getting active blends:", error)
    throw error
  }
}

export async function joinBlend(blendId: number, userId: string) {
  try {
    // Check if the blend is full
    const blendQuery = `
      SELECT b.*, COUNT(bp.id) as current_participants
      FROM blends b
      LEFT JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE b.id = $1
      GROUP BY b.id
    `

    const blend = await executeQuery(blendQuery, [blendId])

    if (!blend[0]) {
      throw new Error("Blend not found")
    }

    if (blend[0].current_participants >= blend[0].max_participants) {
      throw new Error("This blend is already full")
    }

    // Add the user as a participant
    const participantQuery = `
      INSERT INTO blend_participants (blend_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (blend_id, user_id) DO NOTHING
      RETURNING *
    `

    const result = await executeQuery(participantQuery, [blendId, userId])

    // Add the user as a collaborator to the playlist
    await addCollaborator(blend[0].playlist_id, userId)

    revalidatePath("/blend")
    revalidatePath(`/playlist/${blend[0].playlist_id}`)

    return result[0]
  } catch (error) {
    console.error("Error joining blend:", error)
    throw error
  }
}

// Add this function to the existing db-actions.ts file
export async function getBlendById(blendId: string | number) {
  try {
    const query = `
      SELECT b.*, p.name as playlist_name, p.id as playlist_id, p.spotify_id,
             p.image_url, p.description, p.owner_id,
             COUNT(bp.id) as current_participants
      FROM blends b
      JOIN playlists p ON b.playlist_id = p.id
      LEFT JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE b.id = $1
      GROUP BY b.id, p.name, p.id, p.spotify_id, p.image_url, p.description, p.owner_id
    `

    const result = await executeQuery(query, [blendId])
    return result[0] || null
  } catch (error) {
    console.error("Error getting blend by ID:", error)
    throw error
  }
}

// Session helper to get the current user
export async function getCurrentUser() {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return null
    }

    // Check if user exists in our database
    let user = await getUserById(session.user.id)

    // If not, create the user
    if (!user) {
      user = await createOrUpdateUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        spotify_id: session.user.id,
      })
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function searchTracks(query: string) {
  const session = await getSession()

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
