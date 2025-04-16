"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Music, User, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { searchTracks } from "@/lib/spotify-service"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState({
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
      // For now, we'll just search tracks using our service
      const tracks = await searchTracks(query, 20)

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

  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Search</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-spotify-purple" />
            Search for Music
          </CardTitle>
          <CardDescription>Find your favorite songs, artists, and playlists</CardDescription>
        </CardHeader>
        <CardContent>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.tracks.map((track) => (
                  <Card key={track.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-40 w-full">
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
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate">{track.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
