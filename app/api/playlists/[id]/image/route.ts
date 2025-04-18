import { NextResponse } from "next/server"
import { uploadPlaylistCoverImage } from "@/lib/enhanced-spotify-service"

// PUT to upload a custom playlist cover image
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id
    const { image } = await request.json()

    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format. Must be a base64 encoded image." }, { status: 400 })
    }

    await uploadPlaylistCoverImage(playlistId, image)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error uploading playlist cover image:", error)
    return NextResponse.json({ error: "Failed to upload playlist cover image" }, { status: 500 })
  }
}
