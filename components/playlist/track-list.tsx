"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Clock, MoreHorizontal, Play, Trash } from "lucide-react"
import { formatDuration } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { removeTrackFromPlaylistClient } from "@/lib/client-actions"

export function TrackList({ tracks, playlistId }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState({})

  const handleRemoveTrack = async (trackId) => {
    setIsRemoving((prev) => ({ ...prev, [trackId]: true }))

    try {
      await removeTrackFromPlaylistClient(playlistId, trackId)

      toast({
        title: "Track removed",
        description: "The track has been removed from the playlist",
      })

      // Refresh the page to update the track list
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to remove track",
        description: error.message || "An error occurred while removing the track",
        variant: "destructive",
      })
    } finally {
      setIsRemoving((prev) => ({ ...prev, [trackId]: false }))
    }
  }

  if (!tracks || tracks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center p-4 md:p-8 text-center border rounded-lg border-spotify-purple/20 bg-spotify-purple-dark/10"
      >
        <p className="text-muted-foreground">This playlist is empty</p>
        <p className="text-sm text-muted-foreground">Search for tracks to add to this playlist</p>
      </motion.div>
    )
  }

  // Mobile view for tracks
  const renderMobileTrack = (track, index) => (
    <motion.div
      key={`${track.id}-${index}-mobile`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex flex-col p-3 border-b border-spotify-purple/10 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0 w-10 h-10 group">
          {track.image_url ? (
            <Image
              src={track.image_url || "/placeholder.svg"}
              alt={track.album || track.name}
              fill
              className="object-cover rounded"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-spotify-purple-dark/30 rounded">
              <Play className="w-4 h-4 text-spotify-purple-light" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-white">{track.name}</div>
          <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 hover:bg-spotify-purple/10"
          onClick={() => handleRemoveTrack(track.id)}
          disabled={isRemoving[track.id]}
        >
          <Trash className="w-4 h-4 text-spotify-purple-light" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-1 ml-13">{formatDuration(track.duration_ms)}</div>
    </motion.div>
  )

  // Desktop view for tracks
  const renderDesktopTrack = (track, index) => (
    <motion.div
      key={`${track.id}-${index}-desktop`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4 hover:bg-spotify-purple/10 transition-colors duration-200"
    >
      <div className="w-8 text-center text-muted-foreground">{index + 1}</div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex-shrink-0 w-10 h-10 group">
          {track.image_url ? (
            <Image
              src={track.image_url || "/placeholder.svg"}
              alt={track.album || track.name}
              fill
              className="object-cover rounded"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-spotify-purple-dark/30 rounded">
              <Play className="w-4 h-4 text-spotify-purple-light" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded">
            <Play className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="font-medium truncate text-white">{track.name}</div>
          <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{formatDuration(track.duration_ms)}</div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-spotify-purple/10">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-spotify-purple/30 bg-background">
            <DropdownMenuItem
              onClick={() => handleRemoveTrack(track.id)}
              disabled={isRemoving[track.id]}
              className="hover:bg-spotify-purple/10 focus:bg-spotify-purple/10"
            >
              <Trash className="w-4 h-4 mr-2 text-spotify-purple-light" />
              {isRemoving[track.id] ? "Removing..." : "Remove from playlist"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border rounded-lg border-spotify-purple/20 bg-gradient-to-br from-background to-spotify-purple-dark/5"
    >
      {/* Desktop header - hidden on mobile */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4 text-sm text-muted-foreground border-b border-spotify-purple/20">
        <div className="w-8 text-center">#</div>
        <div>Title</div>
        <div className="flex items-center">
          <Clock className="w-4 h-4" />
        </div>
        <div className="w-8"></div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden divide-y divide-spotify-purple/10">
        {tracks.map((track, index) => renderMobileTrack(track, index))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block divide-y divide-spotify-purple/10">
        {tracks.map((track, index) => renderDesktopTrack(track, index))}
      </div>
    </motion.div>
  )
}
