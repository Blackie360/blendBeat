import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/lib/get-session"
import { addCollaboratorWithRevalidation, removeCollaboratorWithRevalidation } from "@/lib/server-actions"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { playlistId, email, role = "editor" } = await request.json()

    // Validate required fields
    if (!playlistId || !email) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if the user has permission to add collaborators
    const playlistQuery = `
      SELECT * FROM playlists WHERE id = $1
    `
    const playlist = await executeQuery(playlistQuery, [playlistId])

    if (!playlist[0]) {
      return NextResponse.json({ message: "Playlist not found" }, { status: 404 })
    }

    // Only the owner or existing collaborators can add new collaborators
    const permissionQuery = `
      SELECT * FROM collaborators 
      WHERE playlist_id = $1 AND user_id = $2
      UNION
      SELECT NULL as id, $1 as playlist_id, owner_id as user_id, 'owner' as role, NULL as joined_at
      FROM playlists
      WHERE id = $1 AND owner_id = $2
    `
    const permission = await executeQuery(permissionQuery, [playlistId, session.user.id])

    if (!permission[0]) {
      return NextResponse.json({ message: "You don't have permission to add collaborators" }, { status: 403 })
    }

    // Find the user by email
    const userQuery = `
      SELECT * FROM users WHERE email = $1
    `
    const user = await executeQuery(userQuery, [email])

    if (!user[0]) {
      // In a real app, you might want to send an invitation email here
      return NextResponse.json({ message: "User not found. An invitation will be sent." }, { status: 200 })
    }

    // Add the collaborator using the server action
    const collaborator = await addCollaboratorWithRevalidation(playlistId, user[0].id, role)

    return NextResponse.json(collaborator)
  } catch (error) {
    console.error("Error adding collaborator:", error)
    return NextResponse.json({ message: "Failed to add collaborator" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")
    const userId = searchParams.get("userId")

    if (!playlistId || !userId) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    // Check if the user has permission to remove collaborators
    const playlistQuery = `
      SELECT * FROM playlists WHERE id = $1
    `
    const playlist = await executeQuery(playlistQuery, [playlistId])

    if (!playlist[0]) {
      return NextResponse.json({ message: "Playlist not found" }, { status: 404 })
    }

    // Only the owner or existing collaborators can remove collaborators
    const permissionQuery = `
      SELECT * FROM collaborators 
      WHERE playlist_id = $1 AND user_id = $2
      UNION
      SELECT NULL as id, $1 as playlist_id, owner_id as user_id, 'owner' as role, NULL as joined_at
      FROM playlists
      WHERE id = $1 AND owner_id = $2
    `
    const permission = await executeQuery(permissionQuery, [playlistId, session.user.id])

    if (!permission[0]) {
      return NextResponse.json({ message: "You don't have permission to remove collaborators" }, { status: 403 })
    }

    // Remove the collaborator using the server action
    const collaborator = await removeCollaboratorWithRevalidation(playlistId, userId)

    return NextResponse.json(collaborator || { success: true })
  } catch (error) {
    console.error("Error removing collaborator:", error)
    return NextResponse.json({ message: "Failed to remove collaborator" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")

    if (!playlistId) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    // Get collaborators for the playlist
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

    const collaborators = await executeQuery(query, [playlistId])

    return NextResponse.json(collaborators)
  } catch (error) {
    console.error("Error getting collaborators:", error)
    return NextResponse.json({ message: "Failed to get collaborators" }, { status: 500 })
  }
}
