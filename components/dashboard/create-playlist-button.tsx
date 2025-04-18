"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/components/ui/use-toast"
import { Plus, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

export function CreatePlaylistButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const handleCreate = async () => {
    if (!name) {
      toast({
        title: "Please enter a playlist name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      if (!session?.user?.id) {
        throw new Error("User ID not found")
      }

      // Create the playlist in Spotify and sync to our database
      const response = await fetch("/api/playlists/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          isPublic,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create playlist")
      }

      const result = await response.json()

      toast({
        title: "Playlist created!",
        description: "Your new playlist has been created and synced with Spotify.",
      })

      // Refresh the page to show the new playlist
      router.refresh()
      setOpen(false)
      setName("")
      setDescription("")
    } catch (error) {
      toast({
        title: "Failed to create playlist",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={isCreating} className="hover-scale w-full md:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        New Playlist
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-spotify-purple/30 bg-gradient-to-b from-background to-muted sm:max-w-[425px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="purple-gradient-text">Create Playlist</DialogTitle>
            <DialogDescription>Create a new playlist that will be synced with your Spotify account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="name" className="md:text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="md:col-span-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="description" className="md:text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="md:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
              <Label htmlFor="isPublic" className="md:text-right">
                Public
              </Label>
              <div className="md:col-span-3 flex items-center">
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="isPublic" className="ml-2 text-sm text-muted-foreground">
                  Make this playlist visible to others
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="sm:w-auto w-full">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating} className="purple-glow sm:w-auto w-full">
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
