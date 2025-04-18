import { NextResponse } from "next/server"
import { getFeaturedPlaylists } from "@/lib/enhanced-spotify-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const featuredPlaylists = await getFeaturedPlaylists(limit, offset)
    return NextResponse.json(featuredPlaylists)
  } catch (error) {
    console.error("Error fetching featured playlists:", error)
    return NextResponse.json({ error: "Failed to fetch featured playlists" }, { status: 500 })
  }
}
