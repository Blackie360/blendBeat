"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { createBlendPlaylist } from "@/lib/actions"
import { Music, Shuffle, Users } from "lucide-react"

export default function BlendPage() {
  const [participantCount, setParticipantCount] = useState(3)
  const [playlistName, setPlaylistName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleCreateBlend = async () => {
    if (!playlistName) {
      toast({
        title: "Please enter a playlist name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const result = await createBlendPlaylist(playlistName, participantCount)

      toast({
        title: "Blend playlist created!",
        description: "Your collaborative playlist has been created with random participants.",
      })

      // Redirect to the new playlist
      window.location.href = `/playlist/${result.playlistId}`
    } catch (error) {
      toast({
        title: "Failed to create blend playlist",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="mb-8 text-4xl font-bold text-center purple-gradient-text">Create a Blend</h1>

      <Card className="animated-border">
        <CardHeader>
          <CardTitle>New Blend Playlist</CardTitle>
          <CardDescription>
            Create a collaborative playlist with random participants who share similar music tastes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Playlist Name</Label>
            <Input
              id="playlist-name"
              placeholder="My Awesome Blend"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="border-spotify-purple/30 focus-visible:ring-spotify-purple"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Number of Random Participants</Label>
              <span className="text-sm font-medium text-spotify-purple-light">{participantCount}</span>
            </div>
            <Slider
              value={[participantCount]}
              min={2}
              max={10}
              step={1}
              onValueChange={(value) => setParticipantCount(value[0])}
              className="[&>span]:bg-spotify-purple"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
            <Card className="bg-muted/50 border-spotify-purple/20 hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-spotify-purple-light" />
                  <h3 className="font-medium">Random Matching</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  We'll match you with random users who have similar music tastes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-spotify-purple/20 hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-5 h-5 text-spotify-purple-light" />
                  <h3 className="font-medium">Diverse Selection</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Discover new music through the diverse tastes of your blend participants
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Button
            className="w-full bg-spotify-purple hover:bg-spotify-purple-dark text-white purple-glow"
            onClick={handleCreateBlend}
            disabled={isCreating}
          >
            <Music className="w-4 h-4 mr-2" />
            {isCreating ? "Creating..." : "Create Blend"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
