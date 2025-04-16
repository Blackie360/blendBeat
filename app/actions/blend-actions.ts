"use server"

import { revalidatePath } from "next/cache"
import {
  createBlend,
  updateBlendPlaylist as updateBlendPlaylistDb,
  addBlendParticipant,
  removeBlendParticipant,
  deleteBlend,
  getBlendById,
} from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createSpotifyPlaylist, addTracksToPlaylist } from "@/lib/spotify-service"
import { sql } from "@vercel/postgres"

export async function createNewBlend(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
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
        await updateBlendPlaylistDb(blend.id, playlist.id)
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

export async function joinBlend(blendId: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "You must be logged in to join a blend" }
    }

    await addBlendParticipant(blendId, session.user.id)

    revalidatePath(`/blend/${blendId}`)
    revalidatePath("/blend")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error joining blend:", error)
    return { error: "Failed to join blend. Please try again." }
  }
}

export async function leaveBlend(blendId: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "You must be logged in to leave a blend" }
    }

    await removeBlendParticipant(blendId, session.user.id)

    revalidatePath(`/blend/${blendId}`)
    revalidatePath("/blend")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error leaving blend:", error)
    return { error: "Failed to leave blend. Please try again." }
  }
}

export async function deleteBlendAction(blendId: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "You must be logged in to delete a blend" }
    }

    await deleteBlend(blendId)

    revalidatePath("/blend")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting blend:", error)
    return { error: "Failed to delete blend. Please try again." }
  }
}

export async function addTracksToBlend(blendId: number, trackUris: string[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "You must be logged in to add tracks" }
    }

    // Get the blend
    const blend = await getBlendById(blendId)
    if (!blend) {
      return { error: "Blend not found" }
    }

    // Check if blend has a playlist
    if (!blend.playlist_id) {
      return { error: "Blend does not have a playlist" }
    }

    // Add tracks to the Spotify playlist
    await addTracksToPlaylist(blend.playlist_id, trackUris)

    revalidatePath(`/blend/${blendId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding tracks to blend:", error)
    return { error: "Failed to add tracks. Please try again." }
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
