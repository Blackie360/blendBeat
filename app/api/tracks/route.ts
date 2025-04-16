import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/lib/get-session"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id, name, artist, album, duration_ms, spotify_uri, image_url, preview_url, playlistId } =
      await request.json()

    // Validate required fields
    if (!id || !name || !artist || !spotify_uri) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Insert or update the track
      const trackQuery = `
        INSERT INTO tracks (
          id, name, artist, album, duration_ms, spotify_uri, image_url, preview_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (spotify_uri) 
        DO UPDATE SET 
          name = $2,
          artist = $3,
          album = $4,
          duration_ms = $5,
          image_url = $7,
          preview_url = $8
        RETURNING *
      `

      const track = await executeQuery(trackQuery, [
        id,
        name,
        artist,
        album || null,
        duration_ms || null,
        spotify_uri,
        image_url || null,
        preview_url || null,
      ])

      // If a playlist ID was provided, add the track to the playlist
      if (playlistId) {
        const playlistTrackQuery = `
          INSERT INTO playlist_tracks (playlist_id, track_id, added_by)
          VALUES ($1, $2, $3)
          ON CONFLICT (playlist_id, track_id) DO NOTHING
          RETURNING *
        `

        await executeQuery(playlistTrackQuery, [playlistId, id, session.user.id])

        // Revalidate the playlist page
        revalidatePath(`/playlist/${playlistId}`)
      }

      // Commit the transaction
      await executeQuery("COMMIT")

      return NextResponse.json(track[0])
    } catch (error) {
      // Rollback the transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error saving track:", error)
    return NextResponse.json({ message: "Failed to save track" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")
    const trackId = searchParams.get("trackId")

    if (!playlistId || !trackId) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    // Remove the track from the playlist
    const query = `
      DELETE FROM playlist_tracks
      WHERE playlist_id = $1 AND track_id = $2
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, trackId])

    // Revalidate the playlist page
    revalidatePath(`/playlist/${playlistId}`)

    return NextResponse.json(result[0] || { success: true })
  } catch (error) {
    console.error("Error removing track:", error)
    return NextResponse.json({ message: "Failed to remove track" }, { status: 500 })
  }
}
