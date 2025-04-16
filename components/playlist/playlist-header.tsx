"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { ExternalLink, LinkIcon, MoreHorizontal, Music, Share, Users } from "lucide-react"
import { inviteToPlaylist } from "@/lib/actions"
import { useState } from "react"
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

export function PlaylistHeader({ playlist }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const { toast } = useToast()

  const handleInvite = async () => {
    if (!email) return

    setIsInviting(true)

    try {
      await inviteToPlaylist(playlist.id, email)

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      })

      setEmail("")
      setIsInviteDialogOpen(false)
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

  const handleOpenInSpotify = () => {
    window.open(playlist.external_urls.spotify, "_blank")
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="relative flex-shrink-0 w-48 h-48 md:w-64 md:h-64 animated-border">
        {playlist.images && playlist.images[0] ? (
          <Image
            src={playlist.images[0].url || "/placeholder.svg"}
            alt={playlist.name}
            fill
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted rounded-lg">
            <Music className="w-16 h-16 text-spotify-purple-light" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-2">
            {playlist.collaborative && (
              <div className="px-2 py-1 text-xs font-medium rounded-full bg-spotify-purple text-white">
                Collaborative
              </div>
            )}
            <div className="text-sm text-muted-foreground">Playlist</div>
          </div>

          <h1 className="mt-2 text-4xl font-bold purple-gradient-text">{playlist.name}</h1>

          {playlist.description && <p className="mt-2 text-muted-foreground">{playlist.description}</p>}

          <div className="flex items-center gap-1 mt-4 text-sm">
            <span className="font-medium">{playlist.owner.display_name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{playlist.tracks.total} tracks</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{playlist.followers?.total || 0} followers</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-6">
          <Button className="bg-spotify-purple hover:bg-spotify-purple-dark text-white">Play</Button>

          <Button
            variant="outline"
            onClick={() => setIsInviteDialogOpen(true)}
            className="border-spotify-purple/30 hover:bg-spotify-purple/10"
          >
            <Users className="w-4 h-4 mr-2" />
            Invite
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="border-spotify-purple/30 hover:bg-spotify-purple/10"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Copy Link
          </Button>

          <Button
            variant="outline"
            onClick={handleOpenInSpotify}
            className="border-spotify-purple/30 hover:bg-spotify-purple/10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Spotify
          </Button>

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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              className="border-spotify-purple/30 hover:bg-spotify-purple/10"
            >
              Cancel
            </Button>
            <Button
              className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
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
