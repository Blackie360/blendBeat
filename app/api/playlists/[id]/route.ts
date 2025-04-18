import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getPlaylistDetails, updatePlaylistDetails } from "@/lib/enhanced-spotify-api"

// GET - Get playlist details
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const playlist = await getPlaylistDetails(playlistId)

    return NextResponse.json(playlist)
  } catch (error: any) {
    console.error("Error getting playlist details:", error)
    return NextResponse.json({ message: error.message || "Failed to get playlist details" }, { status: 500 })
  }
}

// PUT - Update playlist details
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const details = await request.json()

    await updatePlaylistDetails(playlistId, details)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating playlist details:", error)
    return NextResponse.json({ message: error.message || "Failed to update playlist details" }, { status: 500 })
  }
}
