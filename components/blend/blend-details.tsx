"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, Music } from "lucide-react"
import { getSpotifyLinks } from "@/lib/spotify-api"

export function BlendDetails({ blend }) {
  const openInSpotify = () => {
    if (blend.spotify_id) {
      const { url } = getSpotifyLinks(blend.spotify_id)
      window.open(url, "_blank")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-64 h-64 animated-border">
          {blend.image_url ? (
            <Image
              src={blend.image_url || "/placeholder.svg"}
              alt={blend.name}
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-spotify-purple/30 to-spotify-purple-dark/50 rounded-lg">
              <Music className="w-16 h-16 text-spotify-purple-light" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 text-xs font-medium rounded-full bg-spotify-purple text-white">Blend</div>
            </div>
            <h1 className="mt-2 text-3xl font-bold purple-gradient-text">{blend.name}</h1>
            <p className="mt-2 text-muted-foreground">{blend.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {blend.current_participants} of {blend.max_participants} participants
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button className="bg-spotify-purple hover:bg-spotify-purple-dark text-white">Play</Button>

            {blend.spotify_id && (
              <Button variant="outline" onClick={openInSpotify} className="border-spotify-purple/30">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Spotify
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
