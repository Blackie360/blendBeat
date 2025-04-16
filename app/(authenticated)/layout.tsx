"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav"
import { useEffect } from "react"

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Check if the user is authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Only show the mobile navigation on authenticated routes
  const showMobileNav = status === "authenticated" && !pathname.startsWith("/login") && !pathname.startsWith("/auth")

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {children}
      {showMobileNav && (
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      )}
    </div>
  )
}
