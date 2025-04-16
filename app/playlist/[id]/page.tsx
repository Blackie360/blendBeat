import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getPlaylistDetails } from "@/lib/spotify-api"
import { PlaylistHeader } from "@/components/playlist/playlist-header"
import { TrackList } from "@/components/playlist/track-list"
import { CollaboratorsList } from "@/components/playlist/collaborators-list"
import { SearchTracks } from "@/components/playlist/search-tracks"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function PlaylistPage({ params }) {
  const session = await getSession()

  if (!session) {
    redirect("/api/auth/signin")
  }

  const playlist = await getPlaylistDetails(session.accessToken, params.id)

  return (
    <div>
      <MobileNav />
      <div className="container py-10">
        <PlaylistHeader playlist={playlist} />

        <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="mb-4 text-2xl font-bold">Tracks</h2>
            <SearchTracks playlistId={params.id} />
            <TrackList tracks={playlist.tracks.items} playlistId={params.id} />
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold">Collaborators</h2>
            <CollaboratorsList playlistId={params.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
