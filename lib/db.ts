import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client with the DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql.unsafe(query, params)
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
}: {
  name: string
  maxParticipants: number
  creatorId: string
}) {
  try {
    console.log("Creating blend in database:", { name, maxParticipants, creatorId })

    // Insert the blend into the database
    const query = `
      INSERT INTO blends (name, max_participants, is_active, created_at)
      VALUES ($1, $2, true, CURRENT_TIMESTAMP)
      RETURNING *
    `
    const blend = await sql.unsafe(query, [name, maxParticipants])

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
    await sql.unsafe(participantQuery, [blend.rows[0].id, creatorId])

    return blend.rows[0]
  } catch (error) {
    console.error("Error creating blend:", error)
    throw error
  }
}

// Get all blends for a user
export async function getBlendsByUserId(userId: string) {
  try {
    const query = `
      SELECT b.*
      FROM blends b
      JOIN blend_participants bp ON b.id = bp.blend_id
      WHERE bp.user_id = $1
      ORDER BY b.created_at DESC
    `
    const result = await sql.unsafe(query, [userId])
    return result.rows
  } catch (error) {
    console.error("Error getting blends by user ID:", error)
    return []
  }
}

// Get a blend by ID
export async function getBlendById(blendId: number) {
  try {
    const query = `
      SELECT *
      FROM blends
      WHERE id = $1
    `
    const result = await sql.unsafe(query, [blendId])
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting blend by ID:", error)
    return null
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
    const result = await sql.unsafe(query, [blendId])
    return result.rows
  } catch (error) {
    console.error("Error getting blend participants:", error)
    return []
  }
}

// Update a blend's playlist ID
export async function updateBlendPlaylist(blendId: number, playlistId: string) {
  try {
    const query = `
      UPDATE blends
      SET playlist_id = $1
      WHERE id = $2
      RETURNING *
    `
    const result = await sql.unsafe(query, [playlistId, blendId])
    return result.rows[0]
  } catch (error) {
    console.error("Error updating blend playlist:", error)
    throw error
  }
}

// Add a participant to a blend
export async function addBlendParticipant(blendId: number, userId: string) {
  try {
    const query = `
      INSERT INTO blend_participants (blend_id, user_id, joined_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `
    const result = await sql.unsafe(query, [blendId, userId])
    return result.rows[0]
  } catch (error) {
    console.error("Error adding blend participant:", error)
    throw error
  }
}
