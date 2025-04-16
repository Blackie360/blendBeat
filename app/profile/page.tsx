import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentUser } from "@/lib/db-service"
import { getUserProfile, getUserTopTracks, getUserTopArtists } from "@/lib/spotify-service"
import Image from "next/image"
import { Music, User } from "lucide-react"

function ProfileSkeleton() {
  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div>
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-5 w-60" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-5 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-5 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

async function ProfileContent() {
  try {
    const user = await getCurrentUser()
    const spotifyProfile = await getUserProfile()
    const topTracks = await getUserTopTracks("medium_term", 5)
    const topArtists = await getUserTopArtists("medium_term", 5)

    return (
      <>
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border border-spotify-purple/30 purple-glow">
                <AvatarImage
                  src={spotifyProfile.images?.[0]?.url || user?.image || "/placeholder.svg"}
                  alt={spotifyProfile.display_name || user?.name}
                />
                <AvatarFallback className="bg-spotify-purple/20">
                  {(spotifyProfile.display_name || user?.name)?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{spotifyProfile.display_name || user?.name}</CardTitle>
                <CardDescription>{spotifyProfile.email || user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-spotify-purple" />
                Your Top Tracks
              </CardTitle>
              <CardDescription>Your most listened to tracks in the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 relative">
                      {track.album?.images?.[0]?.url ? (
                        <Image
                          src={track.album.images[0].url || "/placeholder.svg"}
                          alt={track.album.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-spotify-purple-dark/30 rounded flex items-center justify-center">
                          <Music className="w-4 h-4 text-spotify-purple-light" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-spotify-purple" />
                Your Top Artists
              </CardTitle>
              <CardDescription>Your most listened to artists in the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topArtists.map((artist, index) => (
                  <div key={artist.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 relative">
                      {artist.images?.[0]?.url ? (
                        <Image
                          src={artist.images[0].url || "/placeholder.svg"}
                          alt={artist.name}
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-spotify-purple-dark/30 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-spotify-purple-light" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{artist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {artist.genres?.slice(0, 2).join(", ") || "Artist"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  } catch (error) {
    console.error("Profile error:", error)

    return (
      <div className="p-4 md:p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">There was an error loading your profile. Please try again later.</p>
        <div className="flex justify-center">
          <a href="/dashboard" className="px-4 py-2 bg-spotify-purple rounded-md text-white">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }
}

export default function ProfilePage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Profile</h1>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  )
}
