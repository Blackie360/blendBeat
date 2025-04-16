import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"
import { CreatePlaylistButton } from "@/components/dashboard/create-playlist-button"
import { getUserPlaylists } from "@/lib/spotify-api"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

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
}
