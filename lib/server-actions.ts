"use server"

import { revalidatePath } from "next/cache"
import {
  addTrackToPlaylist as dbAddTrackToPlaylist,
  removeTrackFromPlaylist as dbRemoveTrackFromPlaylist,
} from "./db-service"

// Wrapper functions that include revalidatePath
export async function addTrackToPlaylistWithRevalidation(playlistId: string, trackId: string, userId: string) {
  const result = await dbAddTrackToPlaylist(playlistId, trackId, userId)
  revalidatePath(`/playlist/${playlistId}`)
  return result
}

export async function removeTrackFromPlaylistWithRevalidation(playlistId: string, trackId: string) {
  const result = await dbRemoveTrackFromPlaylist(playlistId, trackId)
  revalidatePath(`/playlist/${playlistId}`)
  return result
}

export async function addCollaboratorWithRevalidation(playlistId: string, userId: string, role = "editor") {
  // Import here to avoid circular dependencies
  const { addCollaborator } = await import("./db-service")
  const result = await addCollaborator(playlistId, userId, role)
  revalidatePath(`/playlist/${playlistId}`)
  return result
}

export async function removeCollaboratorWithRevalidation(playlistId: string, userId: string) {
  // Import here to avoid circular dependencies
  const { removeCollaborator } = await import("./db-service")
  const result = await removeCollaborator(playlistId, userId)
  revalidatePath(`/playlist/${playlistId}`)
  return result
}

export async function createBlendPlaylistWithRevalidation(name: string, maxParticipants: number, userId: string) {
  // Import here to avoid circular dependencies
  const { createBlendPlaylist } = await import("./db-service")
  const result = await createBlendPlaylist(name, maxParticipants, userId)
  revalidatePath("/dashboard")
  revalidatePath("/blend")
  return result
}

export async function joinBlendWithRevalidation(blendId: number, userId: string) {
  // Import here to avoid circular dependencies
  const { joinBlend } = await import("./db-service")
  const result = await joinBlend(blendId, userId)
  revalidatePath("/blend")
  return result
}
