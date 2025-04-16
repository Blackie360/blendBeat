import { executeQuery } from "./db"
import { getSession } from "./get-session"
import { v4 as uuidv4 } from "uuid"

// Types for better type safety
export interface User {
  id: string
  email: string
  name: string
  image?: string
  spotify_id: string
  created_at?: string
  updated_at?: string
}

export interface Playlist {
  id: string
  name: string
  description?: string
  image_url?: string
  spotify_id?: string
  owner_id: string
  is_collaborative: boolean
  is_public: boolean
  created_at?: string
  updated_at?: string
}

export interface Track {
  id: string
  name: string
  artist: string
  album?: string
  duration_ms?: number
  spotify_uri: string
  image_url?: string
  preview_url?: string
}

export interface Blend {
  id: number
  name: string
  playlist_id: string
  max_participants: number
  is_active: boolean
  created_at: string
  expires_at: string
  current_participants?: number
  playlist_name?: string
}

// User operations
export async function createOrUpdateUser(userData: {
  id: string
  email: string
  name: string
  image?: string
  spotify_id: string
}): Promise<User> {
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

export async function getUserById(id: string): Promise<User | null> {
  try {
    const query = "SELECT * FROM users WHERE id = $1"
    const result = await executeQuery(query, [id])
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw error
  }
}

// Playlist operations
export async function savePlaylist(playlistData: {
  name: string
  description?: string
  image_url?: string
  spotify_id?: string
  owner_id: string
  is_collaborative?: boolean
  is_public?: boolean
}): Promise<Playlist> {
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

    const id = spotify_id || uuidv4()

    const query = `
      INSERT INTO playlists (
        id, name, description, image_url, spotify_id, owner_id, 
        is_collaborative, is_public, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = $2,
        description = $3,
        image_url = $4,
        spotify_id = $5,
        owner_id = $6,
        is_collaborative = $7,
        is_public = $8,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    const result = await executeQuery(query, [
      id,
      name,
      description || null,
      image_url || null,
      spotify_id || id,
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

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
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

export async function getPlaylistById(playlistId: string): Promise<Playlist | null> {
  try {
    const query = "SELECT * FROM playlists WHERE id = $1 OR spotify_id = $1"
    const result = await executeQuery(query, [playlistId])
    return result[0] || null
  } catch (error) {
    console.error("Error getting playlist by ID:", error)
    throw error
  }
}

// Track operations
export async function saveTrack(trackData: {
  id: string
  name: string
  artist: string
  album?: string
  duration_ms?: number
  spotify_uri: string
  image_url?: string
  preview_url?: string
}): Promise<Track> {
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

export async function addTrackToPlaylist(playlistId: string, trackId: string, userId: string) {
  try {
    const query = `
      INSERT INTO playlist_tracks (playlist_id, track_id, added_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (playlist_id, track_id) DO NOTHING
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, trackId, userId])
    return result[0]
  } catch (error) {
    console.error("Error adding track to playlist:", error)
    throw error
  }
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  try {
    const query = `
      DELETE FROM playlist_tracks
      WHERE playlist_id = $1 AND track_id = $2
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, trackId])
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

// Blend operations
export async function createBlendPlaylist(
  name: string,
  maxParticipants: number,
  userId: string,
): Promise<{
  playlistId: string
  blendId: number
}> {
  try {
    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Create a new playlist
      const playlistId = uuidv4()
      const playlistQuery = `
        INSERT INTO playlists (
          id, name, description, owner_id, is_collaborative, is_public, updated_at
        )
        VALUES (
          $1, $2, $3, $4, true, true, CURRENT_TIMESTAMP
        )
        RETURNING *
      `

      const description = `A collaborative blend playlist with up to ${maxParticipants} participants`
      const playlist = await executeQuery(playlistQuery, [playlistId, `${name} (Blend)`, description, userId])

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

      return {
        playlistId: playlist[0].id,
        blendId: blend[0].id,
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

export async function getActiveBlends(): Promise<Blend[]> {
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

    return result[0]
  } catch (error) {
    console.error("Error joining blend:", error)
    throw error
  }
}

// Collaborator operations
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

// Session helper to get the current user
export async function getCurrentUser(): Promise<User | null> {
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
