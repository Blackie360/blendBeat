import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"
import { CreatePlaylistButton } from "@/components/dashboard/create-playlist-button"
import { getUserProfile, getUserPlaylists } from "@/lib/spotify-service"
import { BackButton } from "@/components/navigation/back-button"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  try {
    // Fetch user profile and playlists in parallel
    const [userProfile, userPlaylists] = await Promise.all([
      getUserProfile().catch(() => session.user),
      getUserPlaylists(session.accessToken).catch(() => []),
    ])

    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <DashboardHeader user={userProfile} />

        <div className="flex items-center justify-between my-8">
          <h2 className="text-3xl font-bold">Your Playlists</h2>
          <CreatePlaylistButton />
        </div>

        <PlaylistGrid playlists={userPlaylists} />
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p>There was an error loading your dashboard. Please try again later.</p>
        </div>
      </div>
    )
  }
}
