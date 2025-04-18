"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Music } from "lucide-react"
import { motion } from "framer-motion"

interface Playlist {
  id: string
  name: string
  description: string
  images: Array<{ url: string; height: number; width: number }>
  owner: {
    display_name: string
  }
}

interface FeaturedPlaylistsProps {
  playlists: Playlist[]
}

export function FeaturedPlaylists({ playlists }: FeaturedPlaylistsProps) {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No featured playlists available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {playlists.map((playlist) => (
        <motion.div key={playlist.id} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Link href={`/playlist/${playlist.id}`}>
            <Card className="overflow-hidden h-full hover:shadow-md transition-all duration-200">
              <div className="aspect-square relative">
                {playlist.images?.[0]?.url ? (
                  <Image
                    src={playlist.images[0].url || "/placeholder.svg"}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Music className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{playlist.description}</p>
                <p className="text-xs text-muted-foreground mt-2">By {playlist.owner.display_name}</p>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
