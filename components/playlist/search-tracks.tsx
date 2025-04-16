"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search } from "lucide-react"
import Image from "next/image"
import { searchTracks, addTrackToPlaylist } from "@/lib/actions"
import { formatDuration } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function SearchTracks({ playlistId }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState({})
  const { toast } = useToast()

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!query) return

    setIsSearching(true)

    try {
      const data = await searchTracks(query)
      setResults(data)
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
      await addTrackToPlaylist(playlistId, track.uri)

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
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search for tracks to add..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-spotify-purple/30 bg-background focus:border-spotify-purple focus:ring-spotify-purple"
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

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="border rounded-lg divide-y border-spotify-purple/20 divide-spotify-purple/10 bg-gradient-to-br from-background to-spotify-purple-dark/5"
          >
            {results.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="grid grid-cols-[1fr_auto] items-center gap-4 p-4 hover:bg-spotify-purple/10 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0 w-10 h-10 group">
                    {track.album.images && track.album.images[0] ? (
                      <Image
                        src={track.album.images[0].url || "/placeholder.svg"}
                        alt={track.album.name}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-spotify-purple-dark/30 rounded">
                        <Search className="w-4 h-4 text-spotify-purple-light" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-medium truncate text-white">{track.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{track.artists.map((artist) => artist.name).join(", ")}</span>
                      <span>•</span>
                      <span>{formatDuration(track.duration_ms)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAddTrack(track)}
                  disabled={isAdding[track.id]}
                  className="bg-spotify-purple hover:bg-spotify-purple-dark text-white transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isAdding[track.id] ? "Adding..." : "Add"}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
