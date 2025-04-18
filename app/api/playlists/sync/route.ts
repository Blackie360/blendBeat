import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAndSyncPlaylist } from "@/lib/spotify-sync-service"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, description, isPublic } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    const result = await createAndSyncPlaylist(name, description, isPublic)

    return NextResponse.json({
      success: true,
      playlist: result.localPlaylist,
      spotifyPlaylist: result.spotifyPlaylist,
      message: "Playlist created and synced with Spotify",
    })
  } catch (error: any) {
    console.error("Error creating playlist:", error)
    return NextResponse.json({ message: error.message || "Failed to create playlist" }, { status: 500 })
  }
}
