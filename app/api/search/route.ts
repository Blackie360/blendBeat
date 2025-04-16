import { NextResponse } from "next/server"
import { getSession } from "@/lib/get-session"

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json([])
    }

    const SPOTIFY_API = "https://api.spotify.com/v1"
    const response = await fetch(`${SPOTIFY_API}/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to search tracks")
    }

    const data = await response.json()
    return NextResponse.json(data.tracks.items)
  } catch (error) {
    console.error("Error searching tracks:", error)
    return NextResponse.json({ message: "Failed to search tracks" }, { status: 500 })
  }
}
