import { Suspense } from "react"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"
import { CreatePlaylistButton } from "@/components/dashboard/create-playlist-button"
import { PlaylistSkeleton } from "@/components/dashboard/playlist-skeleton"
import { getCurrentUser } from "@/lib/db-service"
import { getUserPlaylists } from "@/lib/spotify-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"

async function DashboardContent() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    // Get playlists from Spotify API
    const spotifyPlaylists = await getUserPlaylists()

    // Transform Spotify playlists to our format
    const playlists = spotifyPlaylists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image_url: playlist.images[0]?.url,
      is_collaborative: playlist.collaborative,
      owner_id: user.id,
      is_public: playlist.public,
    }))

    return (
      <>
        <DashboardHeader user={user} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between my-6 md:my-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Your Playlists</h2>
          <CreatePlaylistButton />
        </div>

        {playlists.length > 0 ? (
          <PlaylistGrid playlists={playlists} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-spotify-purple" />
                No Playlists Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You don't have any playlists yet. Create a new playlist to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </>
    )
  } catch (error) {
    console.error("Dashboard error:", error)

    // Return a simple error UI instead of redirecting
    return (
      <div className="container py-10">
        <div className="p-4 md:p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Something went wrong</h2>
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

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <Suspense fallback={<PlaylistSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
