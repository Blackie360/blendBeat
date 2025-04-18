import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/auth-error" || path.startsWith("/api/auth")

  // Check if user is authenticated
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const hasSession = !!token

  // Redirect logic
  if (!isPublicPath && !hasSession) {
    // Redirect to login if accessing protected route without session
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, request.url))
  }

  if (path === "/login" && hasSession) {
    // Redirect to dashboard if accessing login with session
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // For authenticated routes, ensure user exists in database
  if (hasSession && !isPublicPath) {
    try {
      // We can't directly access the database in Edge middleware
      // Instead, we'll create an API route to handle this
      const response = await fetch(new URL("/api/auth/ensure-user", request.url), {
        headers: {
          "x-user-id": token.id as string,
          "x-user-email": token.email as string,
          "x-user-name": token.name as string,
          "x-user-image": token.picture as string,
        },
      })

      if (!response.ok) {
        console.error("Failed to ensure user in database")
      }
    } catch (error) {
      console.error("Error ensuring user in database:", error)
    }
  }

  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - fonts folder
     * - assets folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|fonts|assets).*)",
  ],
}
