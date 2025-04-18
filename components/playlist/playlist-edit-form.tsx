"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updatePlaylistDetails } from "@/lib/client-spotify"
import { Loader2 } from "lucide-react"

interface PlaylistEditFormProps {
  playlistId: string
  initialData: {
    name: string
    description: string
    public: boolean
    collaborative: boolean
  }
  onSuccess?: () => void
}

export function PlaylistEditForm({ playlistId, initialData, onSuccess }: PlaylistEditFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updatePlaylistDetails(playlistId, formData)

      toast({
        title: "Playlist updated",
        description: "Your playlist details have been updated successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error updating playlist:", error)
      toast({
        title: "Error",
        description: "Failed to update playlist details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="public"
          checked={formData.public}
          onCheckedChange={(checked) => handleSwitchChange("public", checked)}
        />
        <Label htmlFor="public">Public</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="collaborative"
          checked={formData.collaborative}
          onCheckedChange={(checked) => handleSwitchChange("collaborative", checked)}
          disabled={formData.public} // Collaborative playlists must be private
        />
        <Label htmlFor="collaborative">Collaborative</Label>
        {formData.public && (
          <span className="text-xs text-muted-foreground ml-2">(Collaborative playlists must be private)</span>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  )
}
