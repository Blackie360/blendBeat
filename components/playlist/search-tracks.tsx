"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Search, Plus } from "lucide-react"
import Image from "next/image"
import { searchTracks, addTrackToPlaylist, saveTrack } from "@/lib/db-actions"
import { v4 as uuidv4 } from "uuid"

export function SearchTracks({ playlistId }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState({})
  const { toast } = useToast()

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsSearching(true)

    try {
      const tracks = await searchTracks(query)
      setResults(tracks)
    } catch (error) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddTrack = async (track) => {
    setIsAdding((prev) => ({ ...prev, [track.id]: true }))

    try {
      // First save the track to our database
      const trackId = uuidv4()
      await saveTrack({
        id: trackId,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album?.name,
        duration_ms: track.duration_ms,
        spotify_uri: track.uri,
        image_url: track.album?.images?.[0]?.url,
        preview_url: track.preview_url,
      })

      // Then add it to the playlist
      await addTrackToPlaylist(playlistId, trackId, "")

      toast({
        title: "Track added",
        description: `"${track.name}" has been added to the playlist`,
      })

      // Remove the track from results
      setResults(results.filter((t) => t.id !== track.id))
    } catch (error) {
      toast({
        title: "Failed to add track",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAdding((prev) => ({ ...prev, [track.id]: false }))
    }
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          placeholder="Search for tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-spotify-purple/30 focus-visible:ring-spotify-purple"
        />
        <Button
          type="submit"
          disabled={isSearching}
          className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="border rounded-lg border-spotify-purple/20 divide-y divide-spotify-purple/10">
          {results.map((track) => (
            <div
              key={track.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 hover:bg-spotify-purple/10 transition-colors"
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
                <div className="font-medium truncate">{track.name}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleAddTrack(track)}
                disabled={isAdding[track.id]}
                className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isAdding[track.id] ? "Adding..." : "Add"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
