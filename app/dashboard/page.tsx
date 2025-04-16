import { Suspense } from "react"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"
import { CreatePlaylistButton } from "@/components/dashboard/create-playlist-button"
import { PlaylistSkeleton } from "@/components/dashboard/playlist-skeleton"
import { getUserPlaylists } from "@/lib/spotify-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"
import { getSession } from "@/lib/auth"

async function DashboardContent() {
  try {
    const session = await getSession()

    if (!session?.user) {
      redirect("/login")
    }

    // Get playlists from Spotify API
    const spotifyPlaylists = await getUserPlaylists(session.accessToken)

    const user = session.user

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
        <DashboardHeader user={session.user} />

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

    // Instead of returning an error UI, throw the error to be caught by error boundary
    throw error
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
