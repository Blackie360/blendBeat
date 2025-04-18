"use client"

export async function addCollaboratorClient(playlistId: string, email: string, role: string) {
  try {
    const response = await fetch("/api/collaborators", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlistId, email, role }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add collaborator")
    }

    return await response.json()
  } catch (error) {
    console.error("Add collaborator error:", error)
    throw error
  }
}

export async function removeCollaboratorClient(playlistId: string, userId: string) {
  try {
    const response = await fetch(`/api/collaborators?playlistId=${playlistId}&userId=${userId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to remove collaborator")
    }

    return await response.json()
  } catch (error) {
    console.error("Remove collaborator error:", error)
    throw error
  }
}
