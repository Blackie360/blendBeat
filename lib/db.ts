import { neon } from "@neondatabase/serverless"

// Initialize the SQL client with the DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL!)

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Error executing query:", error)
    throw error
  }
}

// Create a new blend
export async function createBlend({
  name,
  maxParticipants,
  creatorId,
  playlistId = null,
}: {
  name: string
  maxParticipants: number
  creatorId: string
  playlistId?: string | null
}) {
  try {
    console.log("Creating blend in database:", { name, maxParticipants, creatorId, playlistId })

    // Start a transaction
    await sql.query("BEGIN")

    try {
      // Insert the blend into the database
      const query = `
        INSERT INTO blends (name, playlist_id, max_participants, is_active, created_at, expires_at)
        VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
        RETURNING *
      `
      const blend = await sql.query(query, [name, playlistId, maxParticipants])

      if (!blend.rows[0]) {
        throw new Error("Failed to create blend")
      }

      console.log("Blend created:", blend.rows[0])

      // Add the creator as a participant
      const participantQuery = `
        INSERT INTO blend_participants (blend_id, user_id, joined_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        RETURNING *
      `
      await sql.query(participantQuery, [blend.rows[0].id, creatorId])

      // Commit the transaction
      await sql.query("COMMIT")

      return blend.rows[0]
    } catch (error) {
      // Rollback the transaction on error
      await sql.query("ROLLBACK")
      console.error("Transaction error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error creating blend:", error)
    throw error
  }
}

// Update a blend's playlist ID
export async function updateBlendPlaylist(blendId: number, playlistId: string) {
  try {
    const query = `
      UPDATE blends
      SET playlist_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `
    const result = await sql.query(query, [playlistId, blendId])
    return result.rows[0]
  } catch (error) {
    console.error("Error updating blend playlist:", error)
    throw error
  }
}

// Add a participant to a blend
export async function addBlendParticipant(blendId: number, userId: string) {
  try {
    // Check if the blend is full
    const blendQuery = `
      SELECT b.*, COUNT(bp.id) as current_participants
      FROM blends b
      LEFT JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE b.id = $1
      GROUP BY b.id
    `
    const blend = await sql.query(blendQuery, [blendId])

    if (!blend.rows[0]) {
      throw new Error("Blend not found")
    }

    if (blend.rows[0].current_participants >= blend.rows[0].max_participants) {
      throw new Error("This blend is already full")
    }

    // Check if the user is already a participant
    const checkQuery = `
      SELECT * FROM blend_participants
      WHERE blend_id = $1 AND user_id = $2
    `
    const existingParticipant = await sql.query(checkQuery, [blendId, userId])

    if (existingParticipant.rows.length > 0) {
      return existingParticipant.rows[0] // User is already a participant
    }

    // Add the user as a participant
    const query = `
      INSERT INTO blend_participants (blend_id, user_id, joined_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `
    const result = await sql.query(query, [blendId, userId])
    return result.rows[0]
  } catch (error) {
    console.error("Error adding blend participant:", error)
    throw error
  }
}

// Remove a participant from a blend
export async function removeBlendParticipant(blendId: number, userId: string) {
  try {
    const query = `
      DELETE FROM blend_participants
      WHERE blend_id = $1 AND user_id = $2
      RETURNING *
    `
    const result = await sql.query(query, [blendId, userId])
    return result.rows[0]
  } catch (error) {
    console.error("Error removing blend participant:", error)
    throw error
  }
}

// Delete a blend
export async function deleteBlend(blendId: number) {
  try {
    // Start a transaction
    await sql.query("BEGIN")

    try {
      // Delete all participants
      await sql.query(
        `
        DELETE FROM blend_participants
        WHERE blend_id = $1
      `,
        [blendId],
      )

      // Delete the blend
      const query = `
        DELETE FROM blends
        WHERE id = $1
        RETURNING *
      `
      const result = await sql.query(query, [blendId])

      // Commit the transaction
      await sql.query("COMMIT")

      return result.rows[0]
    } catch (error) {
      // Rollback the transaction on error
      await sql.query("ROLLBACK")
      console.error("Transaction error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error deleting blend:", error)
    throw error
  }
}

// Get a blend by ID
export async function getBlendById(blendId: number) {
  try {
    const query = `
      SELECT b.*, p.name as playlist_name, p.id as playlist_id, p.spotify_id,
             p.image_url, p.description, p.owner_id,
             COUNT(bp.id) as current_participants
      FROM blends b
      LEFT JOIN playlists p ON b.playlist_id = p.id
      LEFT JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE b.id = $1
      GROUP BY b.id, p.name, p.id, p.spotify_id, p.image_url, p.description, p.owner_id
    `
    const result = await sql.query(query, [blendId])
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting blend by ID:", error)
    return null
  }
}

// Get all blends for a user
export async function getBlendsByUserId(userId: string) {
  try {
    const query = `
      SELECT b.*, p.name as playlist_name, p.id as playlist_id, p.spotify_id,
             COUNT(bp.id) as current_participants
      FROM blends b
      LEFT JOIN playlists p ON b.playlist_id = p.id
      JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE bp.user_id = $1
      GROUP BY b.id, p.name, p.id, p.spotify_id
      ORDER BY b.created_at DESC
    `
    const result = await sql.query(query, [userId])
    return result.rows
  } catch (error) {
    console.error("Error getting blends by user ID:", error)
    return []
  }
}

// Get participants for a blend
export async function getBlendParticipants(blendId: number) {
  try {
    const query = `
      SELECT u.*
      FROM users u
      JOIN blend_participants bp ON u.id = bp.user_id
      WHERE bp.blend_id = $1
      ORDER BY bp.joined_at ASC
    `
    const result = await sql.query(query, [blendId])
    return result.rows
  } catch (error) {
    console.error("Error getting blend participants:", error)
    return []
  }
}

// Get all active blends (for discovery)
export async function getActiveBlends(limit = 10, offset = 0) {
  try {
    const query = `
      SELECT b.*, p.name as playlist_name, p.id as playlist_id, p.spotify_id,
             COUNT(bp.id) as current_participants
      FROM blends b
      LEFT JOIN playlists p ON b.playlist_id = p.id
      LEFT JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE b.is_active = true AND b.expires_at > CURRENT_TIMESTAMP
      GROUP BY b.id, p.name, p.id, p.spotify_id
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `
    const result = await sql.query(query, [limit, offset])
    return result.rows
  } catch (error) {
    console.error("Error getting active blends:", error)
    return []
  }
}
