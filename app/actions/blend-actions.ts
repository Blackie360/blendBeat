"use server"

import { revalidatePath } from "next/cache"
import { createBlend } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createSpotifyPlaylist } from "@/lib/spotify-service"
import { sql } from "@neondatabase/serverless"

export async function createNewBlend(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.error("No user session found")
      return { error: "You must be logged in to create a blend" }
    }

    const name = formData.get("name") as string
    const maxParticipants = Number.parseInt(formData.get("maxParticipants") as string) || 5

    if (!name) {
      return { error: "Name is required" }
    }

    console.log("Creating blend with name:", name)
    console.log("Max participants:", maxParticipants)
    console.log("Creator ID:", session.user.id)

    // Create the blend in the database
    const blend = await createBlend({
      name,
      maxParticipants,
      creatorId: session.user.id,
    })

    console.log("Blend created:", blend)

    // Create a Spotify playlist for this blend
    const playlistName = `${name} - Spotify Blend`
    const playlistDescription = `A collaborative playlist created with Spotify Blend`

    try {
      const playlist = await createSpotifyPlaylist(
        session.user.id,
        playlistName,
        playlistDescription,
        true, // collaborative
      )

      console.log("Spotify playlist created:", playlist)

      // Update the blend with the playlist ID
      if (playlist?.id) {
        // Update the blend with the playlist ID
        await updateBlendPlaylist(blend.id, playlist.id)
      }
    } catch (error) {
      console.error("Error creating Spotify playlist:", error)
      // Continue even if playlist creation fails
    }

    revalidatePath("/dashboard")
    revalidatePath("/blend")

    return { success: true, blendId: blend.id }
  } catch (error) {
    console.error("Error creating blend:", error)
    return { error: "Failed to create blend. Please try again." }
  }
}

async function updateBlendPlaylist(blendId: number, playlistId: string) {
  try {
    const result = await sql`
      UPDATE blends
      SET playlist_id = ${playlistId}
      WHERE id = ${blendId}
      RETURNING *
    `
    console.log("Blend updated with playlist ID:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("Error updating blend with playlist ID:", error)
    throw error
  }
}
