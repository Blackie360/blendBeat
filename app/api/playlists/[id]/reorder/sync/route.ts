import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { reorderAndSyncTracks } from "@/lib/spotify-sync-service"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const { rangeStart, insertBefore, rangeLength } = await request.json()

    if (rangeStart === undefined || insertBefore === undefined) {
      return NextResponse.json({ message: "rangeStart and insertBefore are required" }, { status: 400 })
    }

    const result = await reorderAndSyncTracks(playlistId, rangeStart, insertBefore, rangeLength || 1)

    return NextResponse.json({
      success: true,
      result,
      message: "Tracks reordered and synced with Spotify",
    })
  } catch (error: any) {
    console.error("Error reordering tracks:", error)
    return NextResponse.json({ message: error.message || "Failed to reorder tracks" }, { status: 500 })
  }
}
