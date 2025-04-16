import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BentoGrid } from "@/components/ui/bento-grid"
import { formatDistanceToNow } from "date-fns"

interface Playlist {
  id: string
  name: string
  images?: Array<{ url: string }>
  tracks?: { total: number }
  owner?: { display_name: string }
}

interface Track {
  id: string
  name: string
  album?: { images: Array<{ url: string }> }
  artists?: Array<{ name: string }>
}

interface Artist {
  id: string
  name: string
  images?: Array<{ url: string }>
  genres?: string[]
}

interface Blend {
  id: number
  name: string
  playlist_id: string | null
  max_participants: number
  is_active: boolean
  created_at: string
}

interface DashboardContentProps {
  playlists: Playlist[]
  topTracks: Track[]
  topArtists: Artist[]
  blends: Blend[]
}

export function DashboardContent({ playlists, topTracks, topArtists, blends }: DashboardContentProps) {
  const recentPlaylists = playlists.slice(0, 5)
  const recentBlends = blends.slice(0, 3)

  return (
    <div className="space-y-8">
      <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1">
          <CardHeader>
            <CardTitle>Your Spotify Blend Summary</CardTitle>
            <CardDescription>Overview of your collaborative music experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-3xl font-bold">{playlists.length}</div>
                <div className="text-sm text-muted-foreground">Playlists</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-3xl font-bold">{blends.length}</div>
                <div className="text-sm text-muted-foreground">Blends</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-3xl font-bold">{topTracks.length}</div>
                <div className="text-sm text-muted-foreground">Top Tracks</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-3xl font-bold">{topArtists.length}</div>
                <div className="text-sm text-muted-foreground">Top Artists</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Blends */}
        <Card className="col-span-1 row-span-1">
          <CardHeader>
            <CardTitle>Recent Blends</CardTitle>
            <CardDescription>Your collaborative playlists</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBlends.length > 0 ? (
              <ul className="space-y-3">
                {recentBlends.map((blend) => (
                  <li key={blend.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{blend.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(blend.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${blend.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
                    >
                      {blend.is_active ? "Active" : "Inactive"}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No blends created yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/blend">Manage Blends</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Playlists */}
        <Card className="col-span-1 row-span-1">
          <CardHeader>
            <CardTitle>Recent Playlists</CardTitle>
            <CardDescription>Your Spotify playlists</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPlaylists.length > 0 ? (
              <ul className="space-y-3">
                {recentPlaylists.map((playlist) => (
                  <li key={playlist.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                      {playlist.images?.[0]?.url ? (
                        <img
                          src={playlist.images[0].url || "/placeholder.svg"}
                          alt={playlist.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                          🎵
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium truncate max-w-[180px]">{playlist.name}</div>
                      <div className="text-xs text-muted-foreground">{playlist.tracks?.total || 0} tracks</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No playlists found</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/library">View Library</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Top Tracks */}
        <Card className="col-span-1 row-span-1">
          <CardHeader>
            <CardTitle>Top Tracks</CardTitle>
            <CardDescription>Your most listened tracks</CardDescription>
          </CardHeader>
          <CardContent>
            {topTracks.length > 0 ? (
              <ul className="space-y-3">
                {topTracks.slice(0, 5).map((track) => (
                  <li key={track.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                      {track.album?.images?.[0]?.url ? (
                        <img
                          src={track.album.images[0].url || "/placeholder.svg"}
                          alt={track.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                          🎵
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium truncate max-w-[180px]">{track.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {track.artists?.map((a) => a.name).join(", ")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No top tracks available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </BentoGrid>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with Spotify Blend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto py-4 flex flex-col items-center justify-center">
              <Link href="/blend">
                <div className="text-lg font-semibold">Create Blend</div>
                <div className="text-xs text-muted-foreground mt-1">Start a new collaborative playlist</div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
              <Link href="/library">
                <div className="text-lg font-semibold">Browse Library</div>
                <div className="text-xs text-muted-foreground mt-1">Explore your Spotify playlists</div>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-auto py-4 flex flex-col items-center justify-center">
              <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer">
                <div className="text-lg font-semibold">Open Spotify</div>
                <div className="text-xs text-muted-foreground mt-1">Launch the Spotify web player</div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
