import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Allow anonymous sharing analytics
    const { playlistId, shareType, platform } = await request.json()

    if (!playlistId || !shareType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Log the share event
    const query = `
      INSERT INTO share_analytics (
        playlist_id, user_id, share_type, platform, created_at
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `

    const result = await executeQuery(query, [playlistId, session?.user?.id || null, shareType, platform || null])

    return NextResponse.json({ success: true, id: result[0]?.id })
  } catch (error) {
    console.error("Error logging share analytics:", error)
    return NextResponse.json({ error: "Failed to log share analytics" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")

    if (!playlistId) {
      return NextResponse.json({ error: "Missing playlistId parameter" }, { status: 400 })
    }

    // Get share analytics for the playlist
    const query = `
      SELECT 
        share_type, 
        platform, 
        COUNT(*) as count
      FROM share_analytics
      WHERE playlist_id = $1
      GROUP BY share_type, platform
      ORDER BY count DESC
    `

    const result = await executeQuery(query, [playlistId])

    return NextResponse.json({ analytics: result })
  } catch (error) {
    console.error("Error getting share analytics:", error)
    return NextResponse.json({ error: "Failed to get share analytics" }, { status: 500 })
  }
}
