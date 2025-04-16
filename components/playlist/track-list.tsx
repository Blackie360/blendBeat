"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Clock, MoreHorizontal, Play, Trash } from "lucide-react"
import { removeTrackFromPlaylist } from "@/lib/actions"
import { formatDuration } from "@/lib/utils"
import { motion } from "framer-motion"

export function TrackList({ tracks, playlistId }) {
  const { toast } = useToast()

  const handleRemoveTrack = async (trackUri) => {
    try {
      await removeTrackFromPlaylist(playlistId, trackUri)

      toast({
        title: "Track removed",
        description: "The track has been removed from the playlist",
      })
    } catch (error) {
      toast({
        title: "Failed to remove track",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!tracks || tracks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-spotify-purple/20 bg-spotify-purple-dark/10"
      >
        <p className="text-muted-foreground">This playlist is empty</p>
        <p className="text-sm text-muted-foreground">Search for tracks to add to this playlist</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border rounded-lg border-spotify-purple/20 bg-gradient-to-br from-background to-spotify-purple-dark/5"
    >
      <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4 text-sm text-muted-foreground border-b border-spotify-purple/20">
        <div className="w-8 text-center">#</div>
        <div>Title</div>
        <div className="flex items-center">
          <Clock className="w-4 h-4" />
        </div>
        <div className="w-8"></div>
      </div>

      <div className="divide-y divide-spotify-purple/10">
        {tracks.map((item, index) => {
          const track = item.track

          return (
            <motion.div
              key={`${track.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4 hover:bg-spotify-purple/10 transition-colors duration-200"
            >
              <div className="w-8 text-center text-muted-foreground">{index + 1}</div>

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
                      <Play className="w-4 h-4 text-spotify-purple-light" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="font-medium truncate text-white">{track.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </div>
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
                      onClick={() => handleRemoveTrack(track.uri)}
                      className="hover:bg-spotify-purple/10 focus:bg-spotify-purple/10"
                    >
                      <Trash className="w-4 h-4 mr-2 text-spotify-purple-light" />
                      Remove from playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
