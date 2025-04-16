import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Music } from "lucide-react"

export function PlaylistGrid({ playlists }) {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center p-4 md:p-8 border border-spotify-purple/20 rounded-lg bg-spotify-purple-dark/5">
        <h3 className="text-lg md:text-xl font-medium mb-2">No playlists yet</h3>
        <p className="text-muted-foreground">Create a new playlist to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4 md:gap-6">
      {playlists.map((playlist) => (
        <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
          <Card className="overflow-hidden transition-all hover-scale playlist-card h-full">
            <div className="relative aspect-square">
              {playlist.image_url ? (
                <Image
                  src={playlist.image_url || "/placeholder.svg"}
                  alt={playlist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted">
                  <Music className="w-8 h-8 md:w-12 md:h-12 text-spotify-purple-light" />
                </div>
              )}
            </div>

            <CardContent className="p-3 md:p-4">
              <h3 className="font-semibold truncate text-sm md:text-base">{playlist.name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {playlist.description || "No description"}
              </p>
            </CardContent>

            <CardFooter className="p-3 pt-0 md:p-4 md:pt-0">
              {playlist.is_collaborative && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-spotify-purple/30 text-spotify-purple-light text-xs"
                >
                  <Users className="w-3 h-3" />
                  <span className="hidden xs:inline">Collaborative</span>
                </Badge>
              )}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
