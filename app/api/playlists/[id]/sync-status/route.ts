import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkPlaylistSync } from "@/lib/spotify-sync-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const result = await checkPlaylistSync(playlistId)

    return NextResponse.json({
      success: true,
      isInSync: result.isInSync,
      localPlaylist: result.localPlaylist,
      spotifyPlaylist: result.spotifyPlaylist,
    })
  } catch (error: any) {
    console.error("Error checking sync status:", error)
    return NextResponse.json({ message: error.message || "Failed to check sync status" }, { status: 500 })
  }
}
