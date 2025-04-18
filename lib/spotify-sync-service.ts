import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { executeQuery } from "./db"

const SPOTIFY_API = "https://api.spotify.com/v1"

// Helper function to get access token
async function getAccessToken() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new Error("No access token found")
  }

  return session.accessToken
}

// Helper function to make API requests
async function spotifyFetch(endpoint: string, options: RequestInit = {}) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${SPOTIFY_API}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Failed to fetch: ${response.statusText}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Create a playlist in Spotify and sync with our database
export async function createAndSyncPlaylist(name: string, description = "", isPublic = true) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    // 1. Create playlist in Spotify
    const spotifyUser = await spotifyFetch("/me")
    const spotifyPlaylist = await spotifyFetch(`/users/${spotifyUser.id}/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    })

    // 2. Save playlist to our database
    const query = `
      INSERT INTO playlists (
        id, name, description, image_url, spotify_id, owner_id, 
        is_collaborative, is_public, created_at, updated_at, last_synced
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await executeQuery(query, [
      spotifyPlaylist.id,
      spotifyPlaylist.name,
      spotifyPlaylist.description || null,
      spotifyPlaylist.images[0]?.url || null,
      spotifyPlaylist.id,
      session.user.id,
      spotifyPlaylist.collaborative,
      spotifyPlaylist.public,
    ])

    return {
      localPlaylist: result[0],
      spotifyPlaylist,
    }
  } catch (error) {
    console.error("Error creating and syncing playlist:", error)
    throw error
  }
}

// Update playlist details in Spotify and sync with our database
export async function updateAndSyncPlaylist(
  playlistId: string,
  details: { name?: string; description?: string; public?: boolean; collaborative?: boolean },
) {
  try {
    // 1. Update playlist in Spotify
    await spotifyFetch(`/playlists/${playlistId}`, {
      method: "PUT",
      body: JSON.stringify(details),
    })

    // 2. Update playlist in our database
    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    if (details.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`)
      updateValues.push(details.name)
      paramIndex++
    }

    if (details.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`)
      updateValues.push(details.description)
      paramIndex++
    }

    if (details.public !== undefined) {
      updateFields.push(`is_public = $${paramIndex}`)
      updateValues.push(details.public)
      paramIndex++
    }

    if (details.collaborative !== undefined) {
      updateFields.push(`is_collaborative = $${paramIndex}`)
      updateValues.push(details.collaborative)
      paramIndex++
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP, last_synced = CURRENT_TIMESTAMP`)

    const query = `
      UPDATE playlists
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex} OR spotify_id = $${paramIndex}
      RETURNING *
    `

    updateValues.push(playlistId)
    const result = await executeQuery(query, updateValues)

    return result[0]
  } catch (error) {
    console.error("Error updating and syncing playlist:", error)
    throw error
  }
}

// Add tracks to a playlist in Spotify and sync with our database
export async function addAndSyncTracks(playlistId: string, trackUris: string[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    // 1. Add tracks to Spotify playlist
    await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({
        uris: trackUris,
      }),
    })

    // 2. Get track details from Spotify
    const trackIds = trackUris.map((uri) => uri.split(":")[2])
    const tracksResponse = await spotifyFetch(`/tracks?ids=${trackIds.join(",")}`)
    const tracks = tracksResponse.tracks

    // 3. Save tracks to our database and link them to the playlist
    const savedTracks = []
    for (const track of tracks) {
      // Save track
      const saveTrackQuery = `
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

      const trackResult = await executeQuery(saveTrackQuery, [
        track.id,
        track.name,
        track.artists.map((a) => a.name).join(", "),
        track.album?.name || null,
        track.duration_ms,
        track.uri,
        track.album?.images[0]?.url || null,
        track.preview_url || null,
      ])

      // Link track to playlist
      const linkTrackQuery = `
        INSERT INTO playlist_tracks (playlist_id, track_id, added_by, added_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (playlist_id, track_id) DO NOTHING
        RETURNING *
      `

      await executeQuery(linkTrackQuery, [playlistId, track.id, session.user.id])
      savedTracks.push(trackResult[0])
    }

    // 4. Update playlist's last_synced timestamp
    await executeQuery(`UPDATE playlists SET last_synced = CURRENT_TIMESTAMP WHERE id = $1 OR spotify_id = $1`, [
      playlistId,
    ])

    return savedTracks
  } catch (error) {
    console.error("Error adding and syncing tracks:", error)
    throw error
  }
}

// Remove tracks from a playlist in Spotify and sync with our database
export async function removeAndSyncTracks(playlistId: string, trackUris: string[]) {
  try {
    // 1. Remove tracks from Spotify playlist
    await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      body: JSON.stringify({
        tracks: trackUris.map((uri) => ({ uri })),
      }),
    })

    // 2. Remove tracks from our database
    const trackIds = trackUris.map((uri) => uri.split(":")[2])
    const query = `
      DELETE FROM playlist_tracks
      WHERE playlist_id = $1 AND track_id = ANY($2::text[])
      RETURNING *
    `

    const result = await executeQuery(query, [playlistId, trackIds])

    // 3. Update playlist's last_synced timestamp
    await executeQuery(`UPDATE playlists SET last_synced = CURRENT_TIMESTAMP WHERE id = $1 OR spotify_id = $1`, [
      playlistId,
    ])

    return result
  } catch (error) {
    console.error("Error removing and syncing tracks:", error)
    throw error
  }
}

// Reorder tracks in a playlist in Spotify and sync with our database
export async function reorderAndSyncTracks(
  playlistId: string,
  rangeStart: number,
  insertBefore: number,
  rangeLength = 1,
) {
  try {
    // 1. Reorder tracks in Spotify playlist
    await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: "PUT",
      body: JSON.stringify({
        range_start: rangeStart,
        insert_before: insertBefore,
        range_length: rangeLength,
      }),
    })

    // 2. Get the current track order from Spotify
    const spotifyPlaylist = await spotifyFetch(`/playlists/${playlistId}`)
    const trackUris = spotifyPlaylist.tracks.items.map((item) => item.track.uri)
    const trackIds = trackUris.map((uri) => uri.split(":")[2])

    // 3. Update our database to match Spotify's order
    // For simplicity, we'll just update the last_synced timestamp
    // In a real app, you would update the order in your database
    await executeQuery(`UPDATE playlists SET last_synced = CURRENT_TIMESTAMP WHERE id = $1 OR spotify_id = $1`, [
      playlistId,
    ])

    return { success: true, trackIds }
  } catch (error) {
    console.error("Error reordering and syncing tracks:", error)
    throw error
  }
}

// Upload a playlist cover image to Spotify and sync with our database
export async function uploadAndSyncCoverImage(playlistId: string, base64Image: string) {
  try {
    // 1. Upload image to Spotify
    const accessToken = await getAccessToken()
    const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/images`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "image/jpeg",
      },
      body: base64Image.replace(/^data:image\/jpeg;base64,/, ""),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || "Failed to upload cover image")
    }

    // 2. Get the updated playlist from Spotify to get the new image URL
    const spotifyPlaylist = await spotifyFetch(`/playlists/${playlistId}`)
    const imageUrl = spotifyPlaylist.images[0]?.url

    // 3. Update our database with the new image URL
    const query = `
      UPDATE playlists
      SET image_url = $1, last_synced = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 OR spotify_id = $2
      RETURNING *
    `

    const result = await executeQuery(query, [imageUrl, playlistId])

    return result[0]
  } catch (error) {
    console.error("Error uploading and syncing cover image:", error)
    throw error
  }
}

// Check if a playlist is in sync with Spotify
export async function checkPlaylistSync(playlistId: string) {
  try {
    // 1. Get playlist from our database
    const localPlaylistQuery = `
      SELECT * FROM playlists WHERE id = $1 OR spotify_id = $1
    `
    const localPlaylist = await executeQuery(localPlaylistQuery, [playlistId])

    if (!localPlaylist[0]) {
      throw new Error("Playlist not found in local database")
    }

    // 2. Get playlist from Spotify
    const spotifyPlaylist = await spotifyFetch(`/playlists/${playlistId}`)

    // 3. Compare basic details
    const isInSync =
      localPlaylist[0].name === spotifyPlaylist.name &&
      localPlaylist[0].description === (spotifyPlaylist.description || null) &&
      localPlaylist[0].is_public === spotifyPlaylist.public &&
      localPlaylist[0].is_collaborative === spotifyPlaylist.collaborative

    // 4. Update last_synced if in sync
    if (isInSync) {
      await executeQuery(`UPDATE playlists SET last_synced = CURRENT_TIMESTAMP WHERE id = $1 OR spotify_id = $1`, [
        playlistId,
      ])
    }

    return {
      isInSync,
      localPlaylist: localPlaylist[0],
      spotifyPlaylist,
    }
  } catch (error) {
    console.error("Error checking playlist sync:", error)
    throw error
  }
}

// Force sync a playlist with Spotify (pull Spotify data to our database)
export async function forceSyncPlaylist(playlistId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    // 1. Get playlist from Spotify
    const spotifyPlaylist = await spotifyFetch(`/playlists/${playlistId}`)

    // 2. Update our database with Spotify data
    const updateQuery = `
      UPDATE playlists
      SET 
        name = $1,
        description = $2,
        image_url = $3,
        is_public = $4,
        is_collaborative = $5,
        last_synced = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 OR spotify_id = $6
      RETURNING *
    `

    const updatedPlaylist = await executeQuery(updateQuery, [
      spotifyPlaylist.name,
      spotifyPlaylist.description || null,
      spotifyPlaylist.images[0]?.url || null,
      spotifyPlaylist.public,
      spotifyPlaylist.collaborative,
      playlistId,
    ])

    // 3. Sync tracks
    // First, get all tracks from Spotify
    const spotifyTracks = []
    let offset = 0
    const limit = 100
    let hasMore = true

    while (hasMore) {
      const response = await spotifyFetch(`/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`)
      spotifyTracks.push(...response.items)
      offset += limit
      hasMore = response.items.length === limit
    }

    // Clear existing tracks in our database
    await executeQuery(`DELETE FROM playlist_tracks WHERE playlist_id = $1`, [playlistId])

    // Add all tracks from Spotify
    for (const item of spotifyTracks) {
      const track = item.track
      if (!track) continue // Skip null tracks

      // Save track
      const saveTrackQuery = `
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

      await executeQuery(saveTrackQuery, [
        track.id,
        track.name,
        track.artists.map((a) => a.name).join(", "),
        track.album?.name || null,
        track.duration_ms,
        track.uri,
        track.album?.images[0]?.url || null,
        track.preview_url || null,
      ])

      // Link track to playlist
      const linkTrackQuery = `
        INSERT INTO playlist_tracks (playlist_id, track_id, added_by, added_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (playlist_id, track_id) DO NOTHING
      `

      await executeQuery(linkTrackQuery, [
        playlistId,
        track.id,
        item.added_by?.id || session.user.id,
        new Date(item.added_at).toISOString(),
      ])
    }

    return {
      success: true,
      playlist: updatedPlaylist[0],
      trackCount: spotifyTracks.length,
    }
  } catch (error) {
    console.error("Error force syncing playlist:", error)
    throw error
  }
}
