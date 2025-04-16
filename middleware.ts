import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/auth-error" || path.startsWith("/api/auth")

  // Check if user is authenticated
  const hasSessionCookie =
    request.cookies.has("next-auth.session-token") || request.cookies.has("__Secure-next-auth.session-token")

  // Redirect logic
  if (!isPublicPath && !hasSessionCookie) {
    // Redirect to login if accessing protected route without session
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (path === "/login" && hasSessionCookie) {
    // Redirect to dashboard if accessing login with session
    return NextResponse.redirect(new URL("/dashboard", request.url))
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
