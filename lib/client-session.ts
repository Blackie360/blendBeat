"use client"

// Client-side session fetching that doesn't use next/headers
export async function getClientSession() {
  try {
    const response = await fetch("/api/auth/session")
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error("Error getting client session:", error)
    return null
  }
}
