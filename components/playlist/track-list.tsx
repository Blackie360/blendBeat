"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, Play, Trash2, ExternalLink } from "lucide-react"
import { removeTrackFromPlaylistClient } from "@/lib/client-actions"
import { AnimatePresence, motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSpotifyTrackLinks } from "@/lib/spotify-api"

export function TrackList({ tracks, playlistId }) {
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const isMobile = useMobile()

  const handleRemoveTrack = async (trackId: string, trackUri: string) => {
    setIsRemoving((prev) => ({ ...prev, [trackId]: true }))

    try {
      await removeTrackFromPlaylistClient(playlistId, trackId, trackUri)

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
    } finally {
      setIsRemoving((prev) => ({ ...prev, [trackId]: false }))
    }
  }

  const handlePlayPreview = (previewUrl: string) => {
    if (!previewUrl) {
      toast({
        title: "Preview not available",
        description: "This track doesn't have a preview available",
        variant: "destructive",
      })
      return
    }

    const audio = new Audio(previewUrl)
    audio.play()
  }

  const openInSpotify = (trackId: string) => {
    const { url } = getSpotifyTrackLinks(trackId)
    window.open(url, "_blank")
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg border-dashed border-spotify-purple/30">
        <h3 className="mb-2 text-lg font-medium">No tracks yet</h3>
        <p className="text-muted-foreground">Search for tracks above and add them to this playlist.</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <AnimatePresence>
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="group"
            onClick={() => openInSpotify(track.id)}
          >
            {isMobile
              ? renderMobileTrack(track, handleRemoveTrack, handlePlayPreview, openInSpotify, isRemoving)
              : renderDesktopTrack(track, handleRemoveTrack, handlePlayPreview, openInSpotify, isRemoving)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function renderMobileTrack(track, handleRemoveTrack, handlePlayPreview, openInSpotify, isRemoving) {
  return (
    <div className="flex items-center gap-3 p-3 mb-2 border rounded-lg border-spotify-purple/20 hover:bg-spotify-purple/5 cursor-pointer">
      <div className="relative flex-shrink-0 w-12 h-12">
        {track.image_url ? (
          <Image
            src={track.image_url || "/placeholder.svg"}
            alt={track.name}
            fill
            className="object-cover rounded-md"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted rounded-md">
            <Play className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{track.name}</h4>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {track.preview_url && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handlePlayPreview(track.preview_url)
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Play Preview
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              openInSpotify(track.id)
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Spotify
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              handleRemoveTrack(track.id, track.spotify_uri)
            }}
            disabled={isRemoving[track.id]}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isRemoving[track.id] ? "Removing..." : "Remove"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function renderDesktopTrack(track, handleRemoveTrack, handlePlayPreview, openInSpotify, isRemoving) {
  return (
    <div className="flex items-center gap-4 p-3 mb-2 border rounded-lg border-spotify-purple/20 hover:bg-spotify-purple/5 cursor-pointer">
      <div className="relative flex-shrink-0 w-12 h-12">
        {track.image_url ? (
          <Image
            src={track.image_url || "/placeholder.svg"}
            alt={track.name}
            fill
            className="object-cover rounded-md"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted rounded-md">
            <Play className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{track.name}</h4>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>

      {track.added_by_name && (
        <div className="hidden text-sm text-muted-foreground md:block">Added by {track.added_by_name}</div>
      )}

      <div className="hidden text-sm text-muted-foreground md:block">
        {new Date(track.added_at).toLocaleDateString()}
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {track.preview_url && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handlePlayPreview(track.preview_url)
            }}
            className="hidden group-hover:flex"
          >
            <Play className="w-5 h-5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            openInSpotify(track.id)
          }}
          className="hidden group-hover:flex"
        >
          <ExternalLink className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            handleRemoveTrack(track.id, track.spotify_uri)
          }}
          disabled={isRemoving[track.id]}
          className="hidden text-red-500 group-hover:flex hover:text-red-600 hover:bg-red-100"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
