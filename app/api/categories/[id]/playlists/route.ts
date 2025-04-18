import { NextResponse } from "next/server"
import { getCategoryPlaylists } from "@/lib/enhanced-spotify-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const playlists = await getCategoryPlaylists(categoryId, limit, offset)
    return NextResponse.json(playlists)
  } catch (error) {
    console.error("Error fetching category playlists:", error)
    return NextResponse.json({ error: "Failed to fetch category playlists" }, { status: 500 })
  }
}
