import { NextResponse } from "next/server"
import { getSession } from "@/lib/get-session"
import { saveTrack, addTrackToPlaylist, removeTrackFromPlaylist } from "@/lib/db-actions"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id, name, artist, album, duration_ms, spotify_uri, image_url, preview_url, playlistId, trackUri } =
      await request.json()

    // Save the track
    const track = await saveTrack({
      id,
      name,
      artist,
      album,
      duration_ms,
      spotify_uri,
      image_url,
      preview_url,
    })

    // Add the track to the playlist
    await addTrackToPlaylist(playlistId, track.id, session.user.id, trackUri)

    return NextResponse.json({
      success: true,
      track,
      message: "Track added to playlist",
    })
  } catch (error) {
    console.error("Error adding track:", error)
    return NextResponse.json(
      {
        message: "Failed to add track",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const playlistId = url.searchParams.get("playlistId")
    const trackId = url.searchParams.get("trackId")
    const trackUri = url.searchParams.get("trackUri")

    if (!playlistId || !trackId) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    // Remove the track from the playlist
    await removeTrackFromPlaylist(playlistId, trackId, trackUri || undefined)

    return NextResponse.json({
      success: true,
      message: "Track removed from playlist",
    })
  } catch (error) {
    console.error("Error removing track:", error)
    return NextResponse.json(
      {
        message: "Failed to remove track",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
