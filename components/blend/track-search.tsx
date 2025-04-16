"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { searchTracks } from "@/lib/spotify-service"
import { addTracksToBlend } from "@/app/actions/blend-actions"

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  uri: string
}

interface TrackSearchProps {
  blendId: number
}

export function TrackSearch({ blendId }: TrackSearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([])
  const router = useRouter()
  const { toast } = useToast()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const results = await searchTracks(query)
      setSearchResults(results.tracks.items)
    } catch (error) {
      console.error("Error searching tracks:", error)
      toast({
        title: "Error",
        description: "Failed to search tracks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  function toggleTrackSelection(track: Track) {
    if (selectedTracks.some((t) => t.id === track.id)) {
      setSelectedTracks(selectedTracks.filter((t) => t.id !== track.id))
    } else {
      setSelectedTracks([...selectedTracks, track])
    }
  }

  async function handleAddTracks() {
    if (selectedTracks.length === 0) return

    setIsAdding(true)
    try {
      const result = await addTracksToBlend(
        blendId,
        selectedTracks.map((t) => t.uri),
      )

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Added ${selectedTracks.length} tracks to the blend!`,
        })
        setSelectedTracks([])
        setSearchResults([])
        setQuery("")
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding tracks:", error)
      toast({
        title: "Error",
        description: "Failed to add tracks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {selectedTracks.length > 0 && (
        <div className="bg-muted p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Selected Tracks ({selectedTracks.length})</h3>
            <Button size="sm" onClick={handleAddTracks} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add to Blend"}
            </Button>
          </div>
          <ul className="space-y-2">
            {selectedTracks.map((track) => (
              <li key={track.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={track.album.images[0]?.url || "/placeholder.svg"}
                    alt={track.album.name}
                    className="h-8 w-8 rounded"
                  />
                  <div>
                    <div className="font-medium">{track.name}</div>
                    <div className="text-xs text-muted-foreground">{track.artists.map((a) => a.name).join(", ")}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleTrackSelection(track)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Search Results</h3>
          <ul className="space-y-2">
            {searchResults.map((track) => (
              <li
                key={track.id}
                className={`flex items-center justify-between p-2 rounded-md ${
                  selectedTracks.some((t) => t.id === track.id) ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={track.album.images[0]?.url || "/placeholder.svg"}
                    alt={track.album.name}
                    className="h-10 w-10 rounded"
                  />
                  <div>
                    <div className="font-medium">{track.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {track.artists.map((a) => a.name).join(", ")} • {track.album.name}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={selectedTracks.some((t) => t.id === track.id) ? "default" : "outline"}
                  onClick={() => toggleTrackSelection(track)}
                >
                  {selectedTracks.some((t) => t.id === track.id) ? "Selected" : "Select"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
