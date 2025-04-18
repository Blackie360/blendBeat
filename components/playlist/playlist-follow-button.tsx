"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Heart } from "lucide-react"
import { followPlaylist, unfollowPlaylist, checkFollowingPlaylist } from "@/lib/client-spotify"

interface PlaylistFollowButtonProps {
  playlistId: string
  ownerId: string
  userId: string
  className?: string
}

export function PlaylistFollowButton({ playlistId, ownerId, userId, className }: PlaylistFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check if the user is following the playlist
  useEffect(() => {
    async function checkFollowStatus() {
      try {
        // Don't check follow status if the user is the owner
        if (ownerId === userId) {
          setIsFollowing(true)
          setIsLoading(false)
          return
        }

        const { following } = await checkFollowingPlaylist(playlistId)
        setIsFollowing(following)
      } catch (error) {
        console.error("Error checking follow status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkFollowStatus()
  }, [playlistId, ownerId, userId])

  // Toggle follow status
  const toggleFollow = async () => {
    if (ownerId === userId) return // Owner can't unfollow their own playlist

    setIsLoading(true)

    try {
      if (isFollowing) {
        await unfollowPlaylist(playlistId)
        toast({
          title: "Playlist unfollowed",
          description: "You have unfollowed this playlist",
        })
      } else {
        await followPlaylist(playlistId)
        toast({
          title: "Playlist followed",
          description: "You are now following this playlist",
        })
      }

      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error toggling follow status:", error)
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If the user is the owner, don't show the button
  if (ownerId === userId) {
    return null
  }

  return (
    <Button
      onClick={toggleFollow}
      variant={isFollowing ? "default" : "outline"}
      size="sm"
      disabled={isLoading}
      className={className}
    >
      <Heart className={`mr-2 h-4 w-4 ${isFollowing ? "fill-current" : ""}`} />
      {isFollowing ? "Following" : "Follow"}
    </Button>
  )
}
