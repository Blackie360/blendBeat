import { NextResponse } from "next/server"
import { getSession } from "@/lib/get-session"
import { joinBlendWithRevalidation } from "@/lib/server-actions"
import { executeQuery } from "@/lib/db"
import { followPlaylist } from "@/lib/spotify-api"

export async function POST(request: Request, { params }) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const blendId = Number.parseInt(params.id)

    if (isNaN(blendId)) {
      return NextResponse.json({ message: "Invalid blend ID" }, { status: 400 })
    }

    // Get the blend and playlist details
    const blendQuery = `
      SELECT b.*, p.id as playlist_id, p.spotify_id
      FROM blends b
      JOIN playlists p ON b.playlist_id = p.id
      WHERE b.id = $1
    `

    const blend = await executeQuery(blendQuery, [blendId])

    if (!blend[0]) {
      return NextResponse.json({ message: "Blend not found" }, { status: 404 })
    }

    // Join the blend
    await joinBlendWithRevalidation(blendId, session.user.id)

    // If the playlist has a Spotify ID, make the user follow it
    if (blend[0].spotify_id && session.accessToken) {
      try {
        await followPlaylist(session.accessToken, blend[0].spotify_id)
      } catch (spotifyError) {
        console.error("Error following Spotify playlist:", spotifyError)
        // Continue even if Spotify follow fails
      }
    }

    return NextResponse.json({
      success: true,
      playlistId: blend[0].playlist_id,
      spotifyPlaylistId: blend[0].spotify_id,
      message: "Successfully joined the blend",
    })
  } catch (error) {
    console.error("Error joining blend:", error)
    return NextResponse.json(
      {
        message: "Failed to join blend",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
