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
import { Plus } from "lucide-react"
import { createPlaylist } from "@/lib/spotify-api"
import { useSession } from "next-auth/react"

export function CreatePlaylistButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

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
      await createPlaylist(session.user.id, name, description)

      toast({
        title: "Playlist created!",
        description: "Your new playlist has been created.",
      })

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
      <Button onClick={() => setOpen(true)} disabled={isCreating} className="hover-scale">
        <Plus className="w-4 h-4 mr-2" />
        New Playlist
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-spotify-purple/30 bg-gradient-to-b from-background to-muted">
          <DialogHeader>
            <DialogTitle className="purple-gradient-text">Create Playlist</DialogTitle>
            <DialogDescription>Create a new playlist with your own custom name and description.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating} className="purple-glow">
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
