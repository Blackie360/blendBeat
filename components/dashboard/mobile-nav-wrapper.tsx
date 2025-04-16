"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { MobileBottomNav } from "./mobile-bottom-nav"

export function MobileNavWrapper() {
  const { status } = useSession()
  const pathname = usePathname()

  // Only show on authenticated routes and on mobile
  const isAuthenticated = status === "authenticated"
  const isPublicPath =
    pathname === "/" || pathname === "/login" || pathname === "/auth-error" || pathname.startsWith("/api/auth")

  if (!isAuthenticated || isPublicPath) {
    return null
  }

  return (
    <div className="md:hidden">
      <MobileBottomNav />
    </div>
  )
}
