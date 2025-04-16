import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-black">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64">
        <MobileNav />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
