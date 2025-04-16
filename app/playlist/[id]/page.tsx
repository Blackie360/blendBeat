import { redirect } from "next/navigation"
import { PlaylistHeader } from "@/components/playlist/playlist-header"
import { TrackList } from "@/components/playlist/track-list"
import { CollaboratorsList } from "@/components/playlist/collaborators-list"
import { SearchTracks } from "@/components/playlist/search-tracks"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { cookies } from "next/headers"
import { getCurrentUser, getPlaylistById, getPlaylistTracks, getPlaylistCollaborators } from "@/lib/db-actions"

export default async function PlaylistPage({ params }) {
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

    const playlist = await getPlaylistById(params.id)

    if (!playlist) {
      return (
        <div className="container py-10">
          <h2 className="text-3xl font-bold">Playlist not found</h2>
          <p className="mt-4">The playlist you're looking for doesn't exist or you don't have access to it.</p>
          <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-spotify-purple rounded-md text-white">
            Back to Dashboard
          </a>
        </div>
      )
    }

    const tracks = await getPlaylistTracks(playlist.id)
    const collaborators = await getPlaylistCollaborators(playlist.id)

    return (
      <div>
        <MobileNav />
        <div className="container py-10">
          <PlaylistHeader playlist={playlist} />

          <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="mb-4 text-2xl font-bold">Tracks</h2>
              <SearchTracks playlistId={playlist.id} />
              <TrackList tracks={tracks} playlistId={playlist.id} />
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">Collaborators</h2>
              <CollaboratorsList collaborators={collaborators} playlistId={playlist.id} />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Playlist page error:", error)

    return (
      <div className="container py-10">
        <MobileNav />
        <div className="p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
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
