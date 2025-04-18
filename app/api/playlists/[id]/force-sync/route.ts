import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { forceSyncPlaylist } from "@/lib/spotify-sync-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const result = await forceSyncPlaylist(playlistId)

    return NextResponse.json({
      success: true,
      playlist: result.playlist,
      trackCount: result.trackCount,
      message: `Playlist synced with ${result.trackCount} tracks from Spotify`,
    })
  } catch (error: any) {
    console.error("Error force syncing playlist:", error)
    return NextResponse.json({ message: error.message || "Failed to force sync playlist" }, { status: 500 })
  }
}
