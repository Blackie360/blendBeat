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

    // If not, create the user with all available data
    if (!user) {
      user = await createOrUpdateUser({
        id: session.user.id,
        email: session.user.email || `user-${session.user.id}@example.com`, // Fallback email
        name: session.user.name || "Spotify User",
        image: session.user.image,
        spotify_id: session.user.id,
      })

      console.log("Created missing user during getCurrentUser:", user.email)
    } else {
      // Update user data to ensure it's current
      user = await createOrUpdateUser({
        id: session.user.id,
        email: session.user.email || user.email,
        name: session.user.name || user.name,
        image: session.user.image || user.image,
        spotify_id: session.user.id,
      })

      console.log("Updated user data during getCurrentUser:", user.email)
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
