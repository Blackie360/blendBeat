import { getSession } from "@/lib/get-session"
import { getUserPlaylists } from "@/lib/spotify-api"
import { LibraryHeader } from "@/components/library/library-header"
import { LibraryGrid } from "@/components/library/library-grid"
import { redirect } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Suspense } from "react"

function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded-md mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted"></div>
          ))}
      </div>
    </div>
  )
}

async function LibraryContent() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  try {
    // Get playlists from Spotify API
    const spotifyPlaylists = await getUserPlaylists(session.accessToken)

    // Transform Spotify playlists to our format
    const playlists = spotifyPlaylists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image_url: playlist.images[0]?.url,
      is_collaborative: playlist.collaborative,
      owner_id: session.user.id,
      is_public: playlist.public,
      spotify_id: playlist.id,
    }))

    return <LibraryGrid playlists={playlists} />
  } catch (error) {
    console.error("Error fetching library data:", error)
    return (
      <div className="p-4 md:p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">There was an error loading your library. Please try again later.</p>
      </div>
    )
  }
}

export default async function LibraryPage() {
  return (
    <div className="container py-6 space-y-8">
      <div className="mb-6">
        <BackButton />
      </div>

      <LibraryHeader />

      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryContent />
      </Suspense>
    </div>
  )
}
