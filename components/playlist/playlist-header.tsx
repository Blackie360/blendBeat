"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { LinkIcon, MoreHorizontal, Music, Share, Users, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { getSpotifyLinks } from "@/lib/spotify-api"

export function PlaylistHeader({ playlist }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
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
      setIsInviteDialogOpen(false)

      // Refresh the page to update the collaborators list
      router.refresh()
    } catch (error) {
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
          </div>

          <h1 className="mt-2 text-2xl md:text-4xl font-bold purple-gradient-text">{playlist.name}</h1>

          {playlist.description && (
            <p className="mt-2 text-sm md:text-base text-muted-foreground">{playlist.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-6">
          <Button className="bg-spotify-purple hover:bg-spotify-purple-dark text-white flex-1 sm:flex-none">
            Play
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsInviteDialogOpen(true)}
            className="border-spotify-purple/30 hover:bg-spotify-purple/10 flex-1 sm:flex-none"
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Invite</span>
            <span className="xs:hidden">+</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="border-spotify-purple/30 hover:bg-spotify-purple/10 flex-1 sm:flex-none"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Copy Link</span>
            <span className="xs:hidden">Link</span>
          </Button>

          {playlist.spotify_id && (
            <Button
              variant="outline"
              onClick={openInSpotify}
              className="border-spotify-purple/30 hover:bg-spotify-purple/10 flex-1 sm:flex-none"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Open in Spotify</span>
              <span className="xs:hidden">Spotify</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-spotify-purple/10">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              {playlist.spotify_id && (
                <DropdownMenuItem onClick={openInSpotify}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Spotify
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] border-spotify-purple/30 bg-background">
          <DialogHeader>
            <DialogTitle>Invite to Playlist</DialogTitle>
            <DialogDescription>Invite someone to collaborate on "{playlist.name}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-spotify-purple/30 focus-visible:ring-spotify-purple"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              className="sm:w-auto w-full border-spotify-purple/30 hover:bg-spotify-purple/10"
            >
              Cancel
            </Button>
            <Button
              className="bg-spotify-purple hover:bg-spotify-purple-dark text-white sm:w-auto w-full"
              onClick={handleInvite}
              disabled={isInviting}
            >
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
