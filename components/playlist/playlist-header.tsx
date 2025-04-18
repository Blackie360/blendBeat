"use client"

import { useState } from "react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Music, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSpotifyLinks } from "@/lib/spotify-api"
import { PlaylistShareMenu } from "@/components/sharing/playlist-share-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SyncBadge } from "@/components/sync/sync-badge"
import { SyncButton } from "@/components/sync/sync-button"

export function PlaylistHeader({ playlist, isOwner = false }) {
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleInvite = async () => {
    if (!email) return

    setIsInviting(true)

    try {
      const response = await fetch("/api/collaborators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          email,
          role: "editor",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to invite collaborator")
      }

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      })

      setEmail("")

      // Refresh the page to update the collaborators list
      router.refresh()
    } catch (error) {
      console.error("Add collaborator error:", error)
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${playlist.id}`)

    toast({
      title: "Link copied",
      description: "Playlist link copied to clipboard",
    })
  }

  const openInSpotify = () => {
    if (playlist.spotify_id) {
      const { url } = getSpotifyLinks(playlist.spotify_id)
      window.open(url, "_blank")
    } else {
      toast({
        title: "Not available in Spotify",
        description: "This playlist is not yet synced with Spotify",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <div className="relative flex-shrink-0 w-full h-48 sm:w-48 sm:h-48 md:w-64 md:h-64 animated-border mx-auto sm:mx-0">
        {playlist.image_url ? (
          <Image
            src={playlist.image_url || "/placeholder.svg"}
            alt={playlist.name}
            fill
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted rounded-lg">
            <Music className="w-12 h-12 md:w-16 md:h-16 text-spotify-purple-light" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-2">
            {playlist.is_collaborative && (
              <div className="px-2 py-1 text-xs font-medium rounded-full bg-spotify-purple text-white">
                Collaborative
              </div>
            )}
            <div className="text-sm text-muted-foreground">Playlist</div>

            {/* Add sync status badge */}
            {playlist.sync_status && (
              <SyncBadge playlistId={playlist.id} lastSynced={playlist.last_synced} syncStatus={playlist.sync_status} />
            )}
          </div>

          <h1 className="mt-2 text-2xl md:text-4xl font-bold purple-gradient-text">{playlist.name}</h1>

          {playlist.description && (
            <p className="mt-2 text-sm md:text-base text-muted-foreground">{playlist.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Add the PlaylistShareMenu component */}
          <PlaylistShareMenu
            playlist={{
              id: playlist.id,
              name: playlist.name,
              description: playlist.description,
              image_url: playlist.image_url,
              track_count: playlist.tracks?.length || 0,
              owner_name: playlist.owner_name || "Spotify User",
            }}
          />

          {playlist.spotify_id && (
            <Button variant="outline" size="sm" onClick={openInSpotify}>
              Open in Spotify
            </Button>
          )}

          {/* Add sync button for playlist owners */}
          {isOwner && <SyncButton playlistId={playlist.id} />}

          {/* Add analytics button for playlist owners */}
          {isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/playlist/${playlist.id}/analytics`}>
                <BarChart2 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
