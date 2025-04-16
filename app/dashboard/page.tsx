import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"
import { CreatePlaylistButton } from "@/components/dashboard/create-playlist-button"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { cookies } from "next/headers"
import { getCurrentUser, getUserPlaylists } from "@/lib/db-actions"

export default async function DashboardPage() {
  // Check for session cookie directly
  const cookieStore = cookies()
  const hasSessionCookie =
    cookieStore.has("next-auth.session-token") || cookieStore.has("__Secure-next-auth.session-token")

  if (!hasSessionCookie) {
    redirect("/login")
  }

  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    const playlists = await getUserPlaylists(user.id)

    return (
      <div>
        <MobileNav />
        <div className="container py-10">
          <DashboardHeader user={user} />

          <div className="flex items-center justify-between my-8">
            <h2 className="text-3xl font-bold">Your Playlists</h2>
            <CreatePlaylistButton />
          </div>

          <PlaylistGrid playlists={playlists} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)

    // Return a simple error UI instead of redirecting
    return (
      <div className="container py-10">
        <MobileNav />
        <div className="p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">There was an error loading your dashboard. Please try again later.</p>
          <div className="flex justify-center">
            <a href="/login" className="px-4 py-2 bg-spotify-purple rounded-md text-white">
              Return to Login
            </a>
          </div>
        </div>
      </div>
    )
  }
}
