import { cookies } from "next/headers"

export async function getSession() {
  try {
    // Get the session token from cookies
    const cookieStore = cookies()
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value || cookieStore.get("__Secure-next-auth.session-token")?.value

    if (!sessionToken) {
      return null
    }

    // Get the session from the API
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      headers: {
        cookie: `next-auth.session-token=${sessionToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const session = await response.json()

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}
