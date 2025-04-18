import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addItemsToPlaylist, removeItemsFromPlaylist } from "@/lib/enhanced-spotify-api"

// POST - Add tracks to playlist
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const { uris } = await request.json()

    if (!Array.isArray(uris) || uris.length === 0) {
      return NextResponse.json({ message: "Invalid request: uris must be a non-empty array" }, { status: 400 })
    }

    const result = await addItemsToPlaylist(playlistId, uris)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error adding tracks to playlist:", error)
    return NextResponse.json({ message: error.message || "Failed to add tracks to playlist" }, { status: 500 })
  }
}

// DELETE - Remove tracks from playlist
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const { uris } = await request.json()

    if (!Array.isArray(uris) || uris.length === 0) {
      return NextResponse.json({ message: "Invalid request: uris must be a non-empty array" }, { status: 400 })
    }

    const result = await removeItemsFromPlaylist(playlistId, uris)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error removing tracks from playlist:", error)
    return NextResponse.json({ message: error.message || "Failed to remove tracks from playlist" }, { status: 500 })
  }
}
