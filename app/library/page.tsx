import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Library } from "lucide-react"
import { getUserPlaylists } from "@/lib/spotify-service"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"
import { PlaylistSkeleton } from "@/components/dashboard/playlist-skeleton"

async function LibraryContent() {
  try {
    // Get playlists from Spotify API
    const spotifyPlaylists = await getUserPlaylists(50)

    // Transform Spotify playlists to our format
    const playlists = spotifyPlaylists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image_url: playlist.images[0]?.url,
      is_collaborative: playlist.collaborative,
      owner_id: playlist.owner.id,
      is_public: playlist.public,
    }))

    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Your Playlists</h2>
          {playlists.length > 0 ? (
            <PlaylistGrid playlists={playlists} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You don't have any playlists yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    )
  } catch (error) {
    console.error("Library error:", error)

    return (
      <div className="p-4 md:p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">There was an error loading your library. Please try again later.</p>
        <div className="flex justify-center">
          <a href="/dashboard" className="px-4 py-2 bg-spotify-purple rounded-md text-white">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }
}

export default function LibraryPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Library</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-spotify-purple" />
            Your Music Collection
          </CardTitle>
          <CardDescription>Access your saved songs, playlists, and albums</CardDescription>
        </CardHeader>
      </Card>

      <Suspense fallback={<PlaylistSkeleton />}>
        <LibraryContent />
      </Suspense>
    </div>
  )
}
