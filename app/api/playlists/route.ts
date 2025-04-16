import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/lib/get-session"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id, name, description, owner_id, is_collaborative, is_public } = await request.json()

    // Validate required fields
    if (!id || !name || !owner_id) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Ensure the user is creating a playlist for themselves
    if (owner_id !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Insert the playlist into the database
    const query = `
      INSERT INTO playlists (
        id, name, description, owner_id, is_collaborative, is_public, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await executeQuery(query, [
      id,
      name,
      description || null,
      owner_id,
      is_collaborative || false,
      is_public || true,
    ])

    // Revalidate the dashboard page to show the new playlist
    revalidatePath("/dashboard")

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating playlist:", error)
    return NextResponse.json({ message: "Failed to create playlist" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || session.user.id

    // Get playlists for the user (both owned and collaborative)
    const query = `
      SELECT p.* FROM playlists p
      LEFT JOIN collaborators c ON p.id = c.playlist_id
      WHERE p.owner_id = $1 OR c.user_id = $1
      ORDER BY p.updated_at DESC
    `

    const playlists = await executeQuery(query, [userId])

    return NextResponse.json(playlists)
  } catch (error) {
    console.error("Error getting playlists:", error)
    return NextResponse.json({ message: "Failed to get playlists" }, { status: 500 })
  }
}
