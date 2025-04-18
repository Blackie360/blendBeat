import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadAndSyncCoverImage } from "@/lib/spotify-sync-service"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const playlistId = params.id
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ message: "Image is required" }, { status: 400 })
    }

    const result = await uploadAndSyncCoverImage(playlistId, image)

    return NextResponse.json({
      success: true,
      playlist: result,
      message: "Cover image uploaded and synced with Spotify",
    })
  } catch (error: any) {
    console.error("Error uploading cover image:", error)
    return NextResponse.json({ message: error.message || "Failed to upload cover image" }, { status: 500 })
  }
}
