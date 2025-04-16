import { cookies, headers } from "next/headers"

export async function getSession() {
  // Try to get the session from the cookie
  const cookieStore = cookies()
  const sessionCookie =
    cookieStore.get("next-auth.session-token") || cookieStore.get("__Secure-next-auth.session-token")

  if (!sessionCookie) {
    return null
  }

  try {
    // Make a direct request to the session endpoint on the same origin
    const host = headers().get("host") || "localhost:3000"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"

    const response = await fetch(`${protocol}://${host}/api/auth/session`, {
      headers: {
        cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
      cache: "no-store",
    })

    const session = await response.json()

    return Object.keys(session).length > 0 ? session : null
  } catch (error) {
    console.error("Error fetching session:", error)
    return null
  }
}
