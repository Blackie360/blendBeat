"use client"

import { Suspense } from "react"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/error-boundary"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background to-black">
        <div className="flex-1 ml-0 md:ml-64">
          <main className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-black">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 ml-0 md:ml-64 pb-16 md:pb-0">
        <MobileNav />
        <main className="p-4 md:p-8">
          <ErrorBoundary fallback={<DashboardError />}>
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
