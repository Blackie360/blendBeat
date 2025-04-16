"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Twitter, Facebook, Linkedin, Music } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function BlendShare({ blend }) {
  const [shareUrl, setShareUrl] = useState("")
  const [randomUsers, setRandomUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Set the share URL
    setShareUrl(`${window.location.origin}/blend/join/${blend.id}`)

    // Fetch random users
    const fetchRandomUsers = async () => {
      try {
        const response = await fetch(`/api/users/random?limit=5`)
        if (response.ok) {
          const data = await response.json()
          setRandomUsers(data.users || [])
        }
      } catch (error) {
        console.error("Error fetching random users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRandomUsers()
  }, [blend.id])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    })
  }

  const shareOnSocialMedia = (platform) => {
    let url
    const text = `Join my Spotify Blend playlist "${blend.name}"!`

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      default:
        return
    }

    window.open(url, "_blank", "width=600,height=400")
  }

  const inviteUser = async (userId) => {
    try {
      const response = await fetch("/api/blends/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blendId: blend.id,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to invite user")
      }

      toast({
        title: "Invitation sent",
        description: "User has been invited to join your blend",
      })

      // Remove the invited user from the list
      setRandomUsers(randomUsers.filter((user) => user.id !== userId))
    } catch (error) {
      toast({
        title: "Failed to invite user",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Your Blend</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="link">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="link">Share Link</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="users">Random Users</TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 border-spotify-purple/30 focus-visible:ring-spotify-purple"
                />
                <Button onClick={copyToClipboard} className="bg-spotify-purple hover:bg-spotify-purple-dark text-white">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>

              <div className="p-4 border rounded-lg border-spotify-purple/20 bg-spotify-purple/5">
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="flex items-center gap-3">
                  {blend.image_url ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden">
                      <img src={blend.image_url || "/placeholder.svg"} alt={blend.name} className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-spotify-purple/20 flex items-center justify-center">
                      <Music className="w-6 h-6 text-spotify-purple-light" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{blend.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Spotify Blend • {blend.current_participants} participants
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareOnSocialMedia("twitter")}
                  className="border-spotify-purple/30 hover:bg-spotify-purple/10"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocialMedia("facebook")}
                  className="border-spotify-purple/30 hover:bg-spotify-purple/10"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocialMedia("linkedin")}
                  className="border-spotify-purple/30 hover:bg-spotify-purple/10"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-spotify-purple mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                </div>
              ) : randomUsers.length > 0 ? (
                <div className="space-y-3">
                  {randomUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg border-spotify-purple/20"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image || "/placeholder.svg"} />
                          <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => inviteUser(user.id)}
                        className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
                      >
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No more users available to invite</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
