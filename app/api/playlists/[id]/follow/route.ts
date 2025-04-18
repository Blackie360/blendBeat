import { NextResponse } from "next/server"
import { followPlaylist, unfollowPlaylist, checkUsersFollowPlaylist } from "@/lib/enhanced-spotify-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET to check if current user follows a playlist
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await checkUsersFollowPlaylist(playlistId, [session.user.id])

    return NextResponse.json({ following: result[0] })
  } catch (error) {
    console.error("Error checking playlist follow status:", error)
    return NextResponse.json({ error: "Failed to check playlist follow status" }, { status: 500 })
  }
}

// PUT to follow a playlist
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id
    const { public: isPublic = true } = await request.json()

    await followPlaylist(playlistId, isPublic)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error following playlist:", error)
    return NextResponse.json({ error: "Failed to follow playlist" }, { status: 500 })
  }
}

// DELETE to unfollow a playlist
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id

    await unfollowPlaylist(playlistId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unfollowing playlist:", error)
    return NextResponse.json({ error: "Failed to unfollow playlist" }, { status: 500 })
  }
}
