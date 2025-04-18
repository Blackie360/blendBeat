import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getPlaylistById } from "@/lib/db-service"
import { BackButton } from "@/components/navigation/back-button"
import { ShareAnalytics } from "@/components/analytics/share-analytics"

export default async function PlaylistAnalyticsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const playlistId = params.id
  const playlist = await getPlaylistById(playlistId)

  // Check if the user is the owner of the playlist
  if (playlist?.owner_id !== session.user.id) {
    redirect(`/playlist/${playlistId}`)
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <BackButton />

      <h1 className="text-3xl font-bold mt-4 mb-6">Analytics for {playlist.name}</h1>

      <div className="grid gap-6">
        <ShareAnalytics playlistId={playlistId} />
      </div>
    </div>
  )
}
