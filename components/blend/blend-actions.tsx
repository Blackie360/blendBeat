"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { joinBlend, leaveBlend, deleteBlendAction } from "@/app/actions/blend-actions"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BlendActionsProps {
  blend: {
    id: number
    name: string
  }
  isParticipant: boolean
  isCreator: boolean
}

export function BlendActions({ blend, isParticipant, isCreator }: BlendActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleJoin() {
    setIsLoading(true)
    try {
      const result = await joinBlend(blend.id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "You have joined the collaborative playlist!",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error joining playlist:", error)
      toast({
        title: "Error",
        description: "Failed to join playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLeave() {
    setIsLoading(true)
    try {
      const result = await leaveBlend(blend.id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "You have left the collaborative playlist.",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error leaving playlist:", error)
      toast({
        title: "Error",
        description: "Failed to leave playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsLoading(true)
    try {
      const result = await deleteBlendAction(blend.id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Collaborative playlist deleted successfully.",
        })
        router.push("/blend")
      }
    } catch (error) {
      console.error("Error deleting playlist:", error)
      toast({
        title: "Error",
        description: "Failed to delete playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isParticipant && (
        <Button onClick={handleJoin} disabled={isLoading}>
          Join Playlist
        </Button>
      )}

      {isParticipant && !isCreator && (
        <Button variant="outline" onClick={handleLeave} disabled={isLoading}>
          Leave Playlist
        </Button>
      )}

      {isCreator && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading}>
              Delete Playlist
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the collaborative playlist "{blend.name}" and
                remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isParticipant && blend.id && (
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/blend/join/${blend.id}`)
            toast({
              title: "Link Copied",
              description: "Share this link with friends to invite them to your collaborative playlist!",
            })
          }}
        >
          Share Playlist
        </Button>
      )}
    </div>
  )
}
