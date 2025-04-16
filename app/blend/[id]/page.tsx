import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getBlendById, getBlendParticipants } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { BackButton } from "@/components/navigation/back-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { BlendActions } from "@/components/blend/blend-actions"
import { TrackSearch } from "@/components/blend/track-search"
import { BlendTracks } from "@/components/blend/blend-tracks"
import { getPlaylistDetails } from "@/lib/spotify-service"

export default async function BlendDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const blendId = Number.parseInt(params.id)
  if (isNaN(blendId)) {
    notFound()
  }

  const blend = await getBlendById(blendId)

  if (!blend) {
    notFound()
  }

  const participants = await getBlendParticipants(blendId)

  // Check if current user is a participant
  const isParticipant = participants.some((p) => p.id === session.user.id)

  // Get playlist details if available
  let playlistTracks = []
  if (blend.playlist_id) {
    try {
      const playlistDetails = await getPlaylistDetails(blend.playlist_id)
      playlistTracks = playlistDetails.tracks?.items || []
    } catch (error) {
      console.error("Error fetching playlist details:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{blend.name}</h1>
        <p className="text-gray-500">Created {formatDistanceToNow(new Date(blend.created_at), { addSuffix: true })}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collaborative Playlist Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Status:</div>
              <div>{blend.is_active ? "Active" : "Inactive"}</div>

              <div className="text-gray-500">Max Participants:</div>
              <div>{blend.max_participants}</div>

              <div className="text-gray-500">Playlist:</div>
              <div>
                {blend.playlist_id ? (
                  <a
                    href={`https://open.spotify.com/playlist/${blend.playlist_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:underline"
                  >
                    Open in Spotify
                  </a>
                ) : (
                  "No playlist linked"
                )}
              </div>

              {blend.expires_at && (
                <>
                  <div className="text-gray-500">Expires:</div>
                  <div>{formatDistanceToNow(new Date(blend.expires_at), { addSuffix: true })}</div>
                </>
              )}
            </div>

            <BlendActions
              blend={blend}
              isParticipant={isParticipant}
              isCreator={participants[0]?.id === session.user.id}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Participants ({participants.length}/{blend.max_participants})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participants.length === 0 ? (
                <p className="text-gray-500">No participants yet</p>
              ) : (
                participants.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isParticipant && blend.playlist_id && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Add Tracks to Playlist</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackSearch blendId={blendId} />
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Playlist Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <BlendTracks tracks={playlistTracks} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
