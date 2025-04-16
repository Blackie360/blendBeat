"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, UserMinus } from "lucide-react"
import { getPlaylistCollaborators, removeCollaborator } from "@/lib/actions"

export function CollaboratorsList({ playlistId }) {
  const [collaborators, setCollaborators] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const data = await getPlaylistCollaborators(playlistId)
        setCollaborators(data)
      } catch (error) {
        console.error("Failed to fetch collaborators:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollaborators()
  }, [playlistId])

  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(playlistId, userId)

      // Update the local state
      setCollaborators(collaborators.filter((user) => user.id !== userId))

      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from the playlist",
      })
    } catch (error) {
      toast({
        title: "Failed to remove collaborator",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg">
        <p className="text-muted-foreground">Loading collaborators...</p>
      </div>
    )
  }

  if (collaborators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
        <p className="text-muted-foreground">No collaborators yet</p>
        <p className="text-sm text-muted-foreground">Invite people to collaborate on this playlist</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {collaborators.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.images?.[0]?.url || "/placeholder.svg"} alt={user.display_name} />
              <AvatarFallback>{user.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.display_name}</div>
              {user.isOwner && <div className="text-xs text-muted-foreground">Owner</div>}
            </div>
          </div>

          {!user.isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRemoveCollaborator(user.id)}>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}
    </div>
  )
}
