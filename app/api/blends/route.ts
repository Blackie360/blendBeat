import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/lib/get-session"
import { createBlendPlaylistWithRevalidation } from "@/lib/server-actions"

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

    // Use the server action to create the blend
    const result = await createBlendPlaylistWithRevalidation(name, maxParticipants, session.user.id)

    return NextResponse.json({
      success: true,
      playlistId: result.playlistId,
      blendId: result.blendId,
      message: "Blend playlist created successfully",
    })
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
