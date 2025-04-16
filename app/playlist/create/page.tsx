"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { v4 as uuidv4 } from "uuid"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function CreatePlaylistPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Please enter a playlist name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    setIsSubmitting(true)

    try {
      if (!session?.user?.id) {
        throw new Error("User ID not found")
      }

      // Create a unique ID for the playlist
      const playlistId = uuidv4()

      // Create the playlist in the database
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: playlistId,
          name,
          description,
          owner_id: session.user.id,
          is_collaborative: false,
          is_public: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create playlist")
      }

      toast({
        title: "Playlist created!",
        description: "Your new playlist has been created.",
      })

      // Redirect to the new playlist
      router.push(`/playlist/${playlistId}`)
    } catch (error) {
      console.error("Error creating playlist:", error)
      toast({
        title: "Failed to create playlist",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsCreating(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting && isCreating) {
    return (
      <div className="container max-w-4xl py-6 md:py-10 px-4 sm:px-6">
        <Card className="animated-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-center">Creating your playlist...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 md:py-10 px-4 sm:px-6">
      <h1 className="mb-6 md:mb-8 text-3xl md:text-4xl font-bold text-center purple-gradient-text">Create Playlist</h1>

      <Card className="animated-border">
        <form onSubmit={handleCreate}>
          <CardHeader>
            <CardTitle>New Playlist</CardTitle>
            <CardDescription>Create a new playlist with your own custom name and description</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-spotify-purple/30 focus-visible:ring-spotify-purple"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add an optional description for your playlist"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-spotify-purple/30 focus-visible:ring-spotify-purple"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 sm:flex-row">
            <Button
              type="submit"
              className="w-full bg-spotify-purple hover:bg-spotify-purple-dark text-white purple-glow"
              disabled={isCreating}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? "Creating..." : "Create Playlist"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
