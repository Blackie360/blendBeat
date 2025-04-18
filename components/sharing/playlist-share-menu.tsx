"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Share2, Link, Code, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SocialShare } from "./social-share"
import { PlaylistEmbed } from "./playlist-embed"
import { StoryShare } from "./story-share"
import { DirectMessageShare } from "./direct-message-share"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Import the trackShareAnalytics utility
import { trackShareAnalytics } from "@/lib/analytics-utils"

interface PlaylistShareMenuProps {
  playlist: {
    id: string
    name: string
    description?: string
    image_url?: string
    track_count?: number
    owner_name?: string
  }
  className?: string
}

export function PlaylistShareMenu({ playlist, className }: PlaylistShareMenuProps) {
  const [copied, setCopied] = useState(false)
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}/playlist/${playlist.id}`

  // Track share analytics
  const trackShareAnalyticsOld = async (shareType: string, platform?: string) => {
    try {
      await fetch("/api/share/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          shareType,
          platform,
        }),
      })
    } catch (error) {
      console.error("Error tracking share analytics:", error)
    }
  }

  // Update the handleCopyLink function to track analytics
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Link copied",
      description: "Playlist link copied to clipboard",
    })

    // Track the copy link action
    trackShareAnalytics(playlist.id, "copy_link")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Share Playlist</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy link
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <SocialShare
              url={shareUrl}
              title={playlist.name}
              description={playlist.description}
              image={playlist.image_url}
              trigger={
                <div className="flex items-center w-full">
                  <Link className="w-4 h-4 mr-2" />
                  Social media
                </div>
              }
            />
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <DirectMessageShare
              playlistId={playlist.id}
              playlistName={playlist.name}
              onShare={() => trackShareAnalytics(playlist.id, "direct_message")}
            />
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <StoryShare
              playlistId={playlist.id}
              playlistName={playlist.name}
              playlistImage={playlist.image_url}
              trackCount={playlist.track_count}
              ownerName={playlist.owner_name}
              onShare={() => trackShareAnalytics(playlist.id, "story")}
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setEmbedDialogOpen(true)
              trackShareAnalytics(playlist.id, "embed")
            }}
          >
            <Code className="w-4 h-4 mr-2" />
            Embed playlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Embed Playlist</DialogTitle>
          </DialogHeader>

          <PlaylistEmbed playlistId={playlist.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}
