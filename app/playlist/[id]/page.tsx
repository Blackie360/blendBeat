import { Suspense } from "react"
import { redirect } from "next/navigation"
import { PlaylistHeader } from "@/components/playlist/playlist-header"
import { TrackList } from "@/components/playlist/track-list"
import { CollaboratorsList } from "@/components/playlist/collaborators-list"
import { SearchTracks } from "@/components/playlist/search-tracks"
import { TrackSkeleton } from "@/components/playlist/track-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentUser } from "@/lib/db-service"
import { getPlaylistDetails } from "@/lib/spotify-service"
import { BackButton } from "@/components/navigation/back-button"
import { AuthenticatedMobileNav } from "@/components/navigation/authenticated-mobile-nav"

function CollaboratorsLoading() {
  return (
    <div className="space-y-3">
      <h2 className="mb-4 text-xl md:text-2xl font-bold">Collaborators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg border-spotify-purple/20">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
          ))}
      </div>
    </div>
  )
}

function PlaylistHeaderLoading() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <Skeleton className="relative flex-shrink-0 w-full h-48 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-lg" />
      <div className="flex flex-col justify-between flex-1">
        <div>
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  )
}

async function PlaylistContent({ params }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    // Get playlist details from Spotify API
    const playlist = await getPlaylistDetails(params.id)

    if (!playlist) {
      return (
        <div className="container py-6 md:py-10">
          <h2 className="text-2xl md:text-3xl font-bold">Playlist not found</h2>
          <p className="mt-4">The playlist you're looking for doesn't exist or you don't have access to it.</p>
          <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-spotify-purple rounded-md text-white">
            Back to Dashboard
          </a>
        </div>
      )
    }

    // Transform Spotify tracks to our format
    const tracks = playlist.tracks.items.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((a) => a.name).join(", "),
      album: item.track.album.name,
      duration_ms: item.track.duration_ms,
      spotify_uri: item.track.uri,
      image_url: item.track.album.images[0]?.url,
      preview_url: item.track.preview_url,
      added_at: item.added_at,
      added_by_name: item.added_by.display_name,
    }))

    // Transform playlist to our format
    const playlistData = {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image_url: playlist.images[0]?.url,
      owner_id: user.id,
      is_collaborative: playlist.collaborative,
      is_public: playlist.public,
    }

    return (
      <>
        <div className="mb-6">
          <BackButton />
        </div>

        <PlaylistHeader playlist={playlistData} />

        <div className="grid grid-cols-1 gap-6 mt-6 md:mt-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl md:text-2xl font-bold">Tracks</h2>
            <SearchTracks playlistId={playlist.id} />
            <TrackList tracks={tracks} playlistId={playlist.id} />
          </div>

          <div className="order-first lg:order-none mb-6 lg:mb-0">
            <Suspense fallback={<CollaboratorsLoading />}>
              <h2 className="mb-4 text-xl md:text-2xl font-bold">Collaborators</h2>
              <CollaboratorsList playlistId={playlist.id} />
            </Suspense>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error("Playlist page error:", error)

    return (
      <div className="container py-6 md:py-10">
        <div className="p-4 md:p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">There was an error loading this playlist. Please try again later.</p>
          <div className="flex justify-center">
            <a href="/dashboard" className="px-4 py-2 bg-spotify-purple rounded-md text-white">
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default function PlaylistPage({ params }) {
  return (
    <div className="max-w-[1400px] mx-auto pb-16 md:pb-0">
      <Suspense
        fallback={
          <>
            <div className="mb-6">
              <BackButton />
            </div>
            <PlaylistHeaderLoading />
            <div className="grid grid-cols-1 gap-6 mt-6 md:mt-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-4 text-xl md:text-2xl font-bold">Tracks</h2>
                <TrackSkeleton />
              </div>
              <div className="order-first lg:order-none mb-6 lg:mb-0">
                <CollaboratorsLoading />
              </div>
            </div>
          </>
        }
      >
        <PlaylistContent params={params} />
      </Suspense>
      <AuthenticatedMobileNav />
    </div>
  )
}
