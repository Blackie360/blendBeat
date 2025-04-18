import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addAndSyncTracks, removeAndSyncTracks } from "@/lib/spotify-sync-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const { trackUri, track } = await request.json()

    if (!trackUri) {
      return NextResponse.json({ message: "Track URI is required" }, { status: 400 })
    }

    const result = await addAndSyncTracks(playlistId, [trackUri])

    return NextResponse.json({
      success: true,
      tracks: result,
      message: "Track added and synced with Spotify",
    })
  } catch (error: any) {
    console.error("Error adding track:", error)
    return NextResponse.json({ message: error.message || "Failed to add track" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const { trackUri } = await request.json()

    if (!trackUri) {
      return NextResponse.json({ message: "Track URI is required" }, { status: 400 })
    }

    const result = await removeAndSyncTracks(playlistId, [trackUri])

    return NextResponse.json({
      success: true,
      result,
      message: "Track removed and synced with Spotify",
    })
  } catch (error: any) {
    console.error("Error removing track:", error)
    return NextResponse.json({ message: error.message || "Failed to remove track" }, { status: 500 })
  }
}
