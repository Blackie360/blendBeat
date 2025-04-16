"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Music, ExternalLink } from "lucide-react"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { getSpotifyLinks } from "@/lib/spotify-api"
import { motion } from "framer-motion"

export function PlaylistGrid({ playlists }) {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center p-4 md:p-8 border border-spotify-purple/20 rounded-lg bg-spotify-purple-dark/5">
        <h3 className="text-lg md:text-xl font-medium mb-2">No playlists yet</h3>
        <p className="text-muted-foreground">Create a new playlist to get started</p>
      </div>
    )
  }

  // Define different sizes for the bento grid
  const getSize = (index) => {
    // Create a pattern of different sizes
    const pattern = index % 5
    switch (pattern) {
      case 0: // Large
        return "lg"
      case 1: // Medium horizontal
        return "wide"
      case 2: // Medium vertical
        return "tall"
      default: // Small
        return "sm"
    }
  }

  const openInSpotify = (e, spotifyId) => {
    if (spotifyId) {
      e.preventDefault()
      e.stopPropagation()
      const { url } = getSpotifyLinks(spotifyId)
      window.open(url, "_blank")
    }
  }

  return (
    <BentoGrid>
      {playlists.map((playlist, index) => (
        <BentoGridItem key={playlist.id} size={getSize(index)}>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
            <Link href={`/playlist/${playlist.id}`} className="block h-full">
              <Card className="overflow-hidden transition-all hover-scale playlist-card h-full group">
                <div className="relative aspect-square h-full">
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

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-lg font-bold text-white">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-white/80 line-clamp-2">{playlist.description}</p>
                    )}

                    {playlist.is_collaborative && (
                      <Badge
                        variant="outline"
                        className="mt-2 inline-flex items-center gap-1 border-spotify-purple/30 text-spotify-purple-light text-xs w-fit"
                      >
                        <Users className="w-3 h-3" />
                        <span>Collaborative</span>
                      </Badge>
                    )}
                  </div>

                  {/* Spotify icon */}
                  {playlist.spotify_id && (
                    <div
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => openInSpotify(e, playlist.spotify_id)}
                    >
                      <div className="bg-black/60 p-2 rounded-full">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        </BentoGridItem>
      ))}
    </BentoGrid>
  )
}
