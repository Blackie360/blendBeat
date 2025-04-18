import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateAndSyncPlaylist } from "@/lib/spotify-sync-service"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const details = await request.json()

    const updatedPlaylist = await updateAndSyncPlaylist(playlistId, details)

    return NextResponse.json({
      success: true,
      playlist: updatedPlaylist,
      message: "Playlist updated and synced with Spotify",
    })
  } catch (error: any) {
    console.error("Error updating playlist:", error)
    return NextResponse.json({ message: error.message || "Failed to update playlist" }, { status: 500 })
  }
}
