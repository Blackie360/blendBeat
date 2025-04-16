"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Search, Plus, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { searchTracks, addTrackToPlaylist } from "@/lib/spotify-service"

export function SearchTracks({ playlistId }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState({})
  const { toast } = useToast()
  const router = useRouter()

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsSearching(true)

    try {
      const tracks = await searchTracks(query)
      setResults(tracks)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search failed",
        description: error.message || "Failed to search tracks",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddTrack = async (track) => {
    setIsAdding((prev) => ({ ...prev, [track.id]: true }))

    try {
      await addTrackToPlaylist(playlistId, track.uri)

      toast({
        title: "Track added",
        description: `"${track.name}" has been added to the playlist`,
      })

      // Remove the track from results
      setResults(results.filter((t) => t.id !== track.id))

      // Refresh the page to show the new track
      router.refresh()
    } catch (error) {
      console.error("Add track error:", error)
      toast({
        title: "Failed to add track",
        description: error.message || "An error occurred while adding the track",
        variant: "destructive",
      })
    } finally {
      setIsAdding((prev) => ({ ...prev, [track.id]: false }))
    }
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Search for tracks..."
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

      {results.length > 0 && (
        <div className="border rounded-lg border-spotify-purple/20 divide-y divide-spotify-purple/10">
          {results.map((track) => (
            <div
              key={track.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 hover:bg-spotify-purple/10 transition-colors"
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                {track.album?.images?.[0]?.url ? (
                  <Image
                    src={track.album.images[0].url || "/placeholder.svg"}
                    alt={track.album.name}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-spotify-purple-dark/30 rounded flex items-center justify-center">
                    <Search className="w-4 h-4 text-spotify-purple-light" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="font-medium truncate text-sm sm:text-base">{track.name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleAddTrack(track)}
                disabled={isAdding[track.id]}
                className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
              >
                {isAdding[track.id] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Add</span>
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
