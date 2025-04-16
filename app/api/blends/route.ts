import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/lib/get-session"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, maxParticipants, description } = await request.json()

    // Validate required fields
    if (!name || !maxParticipants) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

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

      const blendDescription =
        description || `A collaborative blend playlist with up to ${maxParticipants} participants`
      const playlist = await executeQuery(playlistQuery, [
        playlistId,
        `${name} (Blend)`,
        blendDescription,
        session.user.id,
      ])

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

      await executeQuery(participantQuery, [blend[0].id, session.user.id])

      // Commit the transaction
      await executeQuery("COMMIT")

      // Revalidate relevant pages
      revalidatePath("/dashboard")
      revalidatePath("/blend")

      return NextResponse.json({
        success: true,
        playlistId: playlist[0].id,
        blendId: blend[0].id,
        message: "Blend playlist created successfully",
      })
    } catch (error) {
      // Rollback the transaction on error
      await executeQuery("ROLLBACK")
      console.error("Database error creating blend playlist:", error)
      return NextResponse.json(
        {
          message: "Database error creating blend playlist",
          error: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creating blend playlist:", error)
    return NextResponse.json(
      {
        message: "Failed to create blend playlist",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get active blends
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

    const blends = await executeQuery(query)

    return NextResponse.json({
      success: true,
      blends,
    })
  } catch (error) {
    console.error("Error getting active blends:", error)
    return NextResponse.json(
      {
        message: "Failed to get active blends",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
