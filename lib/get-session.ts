import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

// Server-side session fetching that doesn't use next/headers
export async function getSession() {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}
