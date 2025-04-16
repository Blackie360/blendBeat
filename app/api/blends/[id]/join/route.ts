import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/lib/get-session"
import { joinBlendWithRevalidation } from "@/lib/server-actions"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const blendId = Number.parseInt(params.id)

    if (isNaN(blendId)) {
      return NextResponse.json({ message: "Invalid blend ID" }, { status: 400 })
    }

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
      return NextResponse.json({ message: "Blend not found" }, { status: 404 })
    }

    if (blend[0].current_participants >= blend[0].max_participants) {
      return NextResponse.json({ message: "This blend is already full" }, { status: 400 })
    }

    // Check if user is already a participant
    const checkQuery = `
      SELECT * FROM blend_participants
      WHERE blend_id = $1 AND user_id = $2
    `

    const existingParticipant = await executeQuery(checkQuery, [blendId, session.user.id])

    if (existingParticipant.length > 0) {
      return NextResponse.json({
        message: "You are already a participant in this blend",
        playlistId: blend[0].playlist_id,
      })
    }

    // Use the server action to join the blend
    await joinBlendWithRevalidation(blendId, session.user.id)

    return NextResponse.json({
      success: true,
      message: "Successfully joined blend",
      playlistId: blend[0].playlist_id,
    })
  } catch (error) {
    console.error("Error joining blend:", error)
    return NextResponse.json(
      {
        message: "Failed to join blend",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
