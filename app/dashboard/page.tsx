import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"
import { CreatePlaylistButton } from "@/components/dashboard/create-playlist-button"
import { getUserPlaylists } from "@/lib/spotify-api"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    // Add console log for debugging
    console.log("No session found, redirecting to login")
    redirect("/login")
  }

  try {
    const playlists = await getUserPlaylists(session.accessToken)

    return (
      <div>
        <MobileNav />
        <div className="container py-10">
          <DashboardHeader user={session.user} />

          <div className="flex items-center justify-between my-8">
            <h2 className="text-3xl font-bold">Your Playlists</h2>
            <CreatePlaylistButton />
          </div>

          <PlaylistGrid playlists={playlists} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching playlists:", error)
    return (
      <div className="container py-10">
        <h2 className="text-3xl font-bold text-red-500">Error loading playlists</h2>
        <p>There was an error loading your playlists. Please try again later.</p>
      </div>
    )
  }
}
