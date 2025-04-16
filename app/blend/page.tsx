"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Music, Shuffle, Users, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export default function BlendPage() {
  const [participantCount, setParticipantCount] = useState(3)
  const [playlistName, setPlaylistName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeBlends, setActiveBlends] = useState([])
  const [isLoadingBlends, setIsLoadingBlends] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchActiveBlends() {
      try {
        const response = await fetch("/api/blends")

        if (!response.ok) {
          throw new Error("Failed to fetch active blends")
        }

        const data = await response.json()
        setActiveBlends(data.blends || [])
      } catch (error) {
        console.error("Error fetching blends:", error)
        toast({
          title: "Error",
          description: "Failed to load active blends",
          variant: "destructive",
        })
      } finally {
        setIsLoadingBlends(false)
      }
    }

    fetchActiveBlends()
  }, [toast])

  const handleCreateBlend = async (e) => {
    e.preventDefault()

    if (!playlistName) {
      toast({
        title: "Please enter a playlist name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/blends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          maxParticipants: participantCount,
          description: `A collaborative blend playlist with up to ${participantCount} participants`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create blend playlist")
      }

      const result = await response.json()

      toast({
        title: "Blend playlist created!",
        description: "Your collaborative playlist has been created and is ready for participants.",
      })

      // Redirect to the new playlist
      router.push(`/playlist/${result.playlistId}`)
    } catch (error) {
      console.error("Error creating blend:", error)
      toast({
        title: "Failed to create blend playlist",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsCreating(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinBlend = async (blendId, playlistId) => {
    try {
      const response = await fetch(`/api/blends/${blendId}/join`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to join blend")
      }

      toast({
        title: "Joined blend!",
        description: "You have successfully joined this blend playlist.",
      })

      router.push(`/playlist/${playlistId}`)
    } catch (error) {
      console.error("Error joining blend:", error)
      toast({
        title: "Failed to join blend",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isSubmitting && isCreating) {
    return (
      <div className="container max-w-4xl py-6 md:py-10 px-4 sm:px-6">
        <Card className="animated-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-spotify-purple animate-spin" />
            <p className="mt-4 text-center">Creating your blend playlist...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 md:py-10 px-4 sm:px-6">
      <h1 className="mb-6 md:mb-8 text-3xl md:text-4xl font-bold text-center purple-gradient-text">Spotify Blend</h1>

      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="create">Create Blend</TabsTrigger>
          <TabsTrigger value="join">Join Blend</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="animated-border">
            <form onSubmit={handleCreateBlend}>
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
                    required
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
                  type="submit"
                  className="w-full bg-spotify-purple hover:bg-spotify-purple-dark text-white purple-glow"
                  disabled={isCreating}
                >
                  <Music className="w-4 h-4 mr-2" />
                  {isCreating ? "Creating..." : "Create Blend"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Join a Blend</CardTitle>
              <CardDescription>Join an active blend to collaborate on playlists with other users</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBlends ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="border-spotify-purple/20">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div>
                              <Skeleton className="h-5 w-32 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-9 w-20" />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : activeBlends.length > 0 ? (
                <div className="space-y-4">
                  {activeBlends.map((blend) => (
                    <Card key={blend.id} className="border-spotify-purple/20">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border border-spotify-purple/30">
                            <AvatarImage src="/placeholder.svg" alt={blend.name} />
                            <AvatarFallback className="bg-spotify-purple/20">{blend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{blend.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {blend.current_participants}/{blend.max_participants} participants
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoinBlend(blend.id, blend.playlist_id)}
                          disabled={blend.current_participants >= blend.max_participants}
                          className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
                        >
                          Join
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">No active blends found. Create a new blend to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
