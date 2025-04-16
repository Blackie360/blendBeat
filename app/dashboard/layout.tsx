import { Suspense } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/error-boundary"
import { DashboardError } from "@/components/dashboard/dashboard-error"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-black">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 pb-16 md:pb-0">
        <MobileNav />
        <main className="p-4 md:p-8">
          <ErrorBoundary fallback={<DashboardError />}>
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          </ErrorBoundary>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}
