"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Music, User, Loader2, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { getSpotifyTrackLinks } from "@/lib/spotify-api"
import { motion } from "framer-motion"

// Define the SpotifyTrack type
interface SpotifyTrack {
  id: string
  name: string
  uri: string
  duration_ms: number
  preview_url: string | null
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; height: number; width: number }[]
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    tracks: SpotifyTrack[]
    artists: any[]
    playlists: any[]
  }>({
    tracks: [],
    artists: [],
    playlists: [],
  })
  const [activeTab, setActiveTab] = useState("tracks")
  const { toast } = useToast()

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsSearching(true)

    try {
      // For now, we'll just search tracks using our API
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error("Failed to search tracks")
      }

      const tracks = await response.json()

      setSearchResults({
        ...searchResults,
        tracks,
      })
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search failed",
        description: error.message || "Failed to search Spotify",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const openInSpotify = (trackId: string) => {
    const { url } = getSpotifyTrackLinks(trackId)
    window.open(url, "_blank")
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

  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Search</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search for songs, artists, or playlists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-spotify-purple/30 focus-visible:ring-spotify-purple flex-1"
            />
            <Button
              type="submit"
              disabled={isSearching}
              className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isSearching ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <BentoGrid>
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <BentoGridItem key={i} size={getSize(i)}>
                  <Skeleton className="h-full w-full rounded-lg" />
                </BentoGridItem>
              ))}
          </BentoGrid>
        </div>
      ) : searchResults.tracks.length > 0 ? (
        <div>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="tracks" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Tracks
              </TabsTrigger>
              <TabsTrigger value="artists" className="flex items-center gap-2" disabled>
                <User className="w-4 h-4" />
                Artists
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex items-center gap-2" disabled>
                <Music className="w-4 h-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="mt-6">
              <BentoGrid>
                {searchResults.tracks.map((track, index) => (
                  <BentoGridItem key={track.id} size={getSize(index)}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="h-full cursor-pointer"
                      onClick={() => openInSpotify(track.id)}
                    >
                      <Card className="overflow-hidden h-full group">
                        <div className="relative h-full w-full">
                          {track.album?.images?.[0]?.url ? (
                            <Image
                              src={track.album.images[0].url || "/placeholder.svg"}
                              alt={track.album.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-spotify-purple-dark/30 flex items-center justify-center">
                              <Music className="w-8 h-8 text-spotify-purple-light" />
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                            <h3 className="font-medium text-white text-lg">{track.name}</h3>
                            <p className="text-sm text-white/80 truncate">
                              {track.artists.map((artist) => artist.name).join(", ")}
                            </p>
                          </div>

                          {/* Spotify icon */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/60 p-2 rounded-full">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </BentoGridItem>
                ))}
              </BentoGrid>
            </TabsContent>
          </Tabs>
        </div>
      ) : query && !isSearching ? (
        <div className="text-center p-8 border border-spotify-purple/20 rounded-lg">
          <p className="text-muted-foreground">No results found for "{query}"</p>
          <p className="text-sm text-muted-foreground mt-2">Try searching for something else</p>
        </div>
      ) : null}
    </div>
  )
}
