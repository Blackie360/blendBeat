"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Music, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { getSpotifyLinks } from "@/lib/spotify-api"

export function LibraryGrid({ playlists }) {
  const { toast } = useToast()
  const [hoveredId, setHoveredId] = useState(null)

  const openInSpotify = (playlistId) => {
    if (!playlistId) {
      toast({
        title: "Spotify ID not found",
        description: "This playlist is not linked to Spotify",
        variant: "destructive",
      })
      return
    }

    const { url } = getSpotifyLinks(playlistId)
    window.open(url, "_blank")
  }

  // Define different sizes for the bento grid
  const getSize = (index) => {
    // Create a pattern of different sizes
    const pattern = index % 5
    switch (pattern) {
      case 0: // Large
        return "col-span-2 row-span-2"
      case 1: // Medium horizontal
        return "col-span-2 row-span-1"
      case 2: // Medium vertical
        return "col-span-1 row-span-2"
      default: // Small
        return "col-span-1 row-span-1"
    }
  }

  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg border-spotify-purple/30">
        <h3 className="text-xl font-medium mb-2">No playlists yet</h3>
        <p className="text-muted-foreground">Create or follow playlists to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Playlists</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">
        {playlists.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            className={`${getSize(index)} relative overflow-hidden`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setHoveredId(playlist.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => openInSpotify(playlist.spotify_id)}
          >
            <Card className="w-full h-full cursor-pointer group overflow-hidden">
              <div className="relative w-full h-full">
                {playlist.image_url ? (
                  <Image
                    src={playlist.image_url || "/placeholder.svg"}
                    alt={playlist.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-spotify-purple/30 to-spotify-purple-dark/50">
                    <Music className="w-12 h-12 text-spotify-purple-light" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white">{playlist.name}</h3>
                  {playlist.description && <p className="text-sm text-white/80 line-clamp-2">{playlist.description}</p>}
                </div>

                {/* Spotify icon */}
                {playlist.spotify_id && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 p-2 rounded-full">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
