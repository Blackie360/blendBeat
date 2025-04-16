import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Music } from "lucide-react"

export function PlaylistGrid({ playlists }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {playlists.map((playlist) => (
        <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
          <Card className="overflow-hidden transition-all hover-scale playlist-card">
            <div className="relative aspect-square">
              {playlist.images && playlist.images[0] ? (
                <Image
                  src={playlist.images[0].url || "/placeholder.svg"}
                  alt={playlist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted">
                  <Music className="w-12 h-12 text-spotify-purple-light" />
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{playlist.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{playlist.tracks.total} tracks</p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              {playlist.collaborative && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-spotify-purple/30 text-spotify-purple-light"
                >
                  <Users className="w-3 h-3" />
                  Collaborative
                </Badge>
              )}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
