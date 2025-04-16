"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, UserMinus, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { addCollaboratorClient, removeCollaboratorClient } from "@/lib/client-actions"

export function CollaboratorsList({ playlistId }) {
  const [collaborators, setCollaborators] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await fetch(`/api/collaborators?playlistId=${playlistId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch collaborators")
        }

        const data = await response.json()
        setCollaborators(data)
      } catch (error) {
        console.error("Failed to fetch collaborators:", error)
        toast({
          title: "Error",
          description: "Failed to load collaborators",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollaborators()
  }, [playlistId, toast])

  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaboratorClient(playlistId, userId)

      // Update the local state
      setCollaborators(collaborators.filter((user) => user.user_id !== userId))

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

  const handleInviteCollaborator = async (e) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsInviting(true)

    try {
      await addCollaboratorClient(playlistId, email, "editor")

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      })

      setEmail("")
      setIsOpen(false)

      // Refresh the page to update the collaborators list
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 md:p-8 border rounded-lg">
        <p className="text-muted-foreground">Loading collaborators...</p>
      </div>
    )
  }

  if (!collaborators || collaborators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center border rounded-lg border-spotify-purple/20 bg-spotify-purple-dark/10">
        <p className="text-muted-foreground">No collaborators yet</p>
        <p className="text-sm text-muted-foreground">Invite people to collaborate on this playlist</p>
        <Button
          variant="outline"
          className="mt-4 border-spotify-purple/30 hover:bg-spotify-purple/10"
          onClick={() => setIsOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Collaborator
        </Button>

        <InviteDialog
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          email={email}
          setEmail={setEmail}
          handleInvite={handleInviteCollaborator}
          isInviting={isInviting}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {collaborators.map((user) => (
          <div
            key={user.user_id}
            className="flex items-center justify-between p-3 border rounded-lg border-spotify-purple/20 bg-spotify-purple-dark/5 hover:bg-spotify-purple-dark/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 md:w-10 md:h-10">
                <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm md:text-base truncate max-w-[120px] md:max-w-[160px]">
                  {user.name}
                </div>
                {user.is_owner && <div className="text-xs text-spotify-purple-light">Owner</div>}
                {!user.is_owner && <div className="text-xs text-muted-foreground">{user.role}</div>}
              </div>
            </div>

            {!user.is_owner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-spotify-purple/10">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-spotify-purple/30 bg-background">
                  <DropdownMenuItem
                    onClick={() => handleRemoveCollaborator(user.user_id)}
                    className="hover:bg-spotify-purple/10 focus:bg-spotify-purple/10"
                  >
                    <UserMinus className="w-4 h-4 mr-2 text-spotify-purple-light" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 border-spotify-purple/30 hover:bg-spotify-purple/10"
        onClick={() => setIsOpen(true)}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Invite Collaborator
      </Button>

      <InviteDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        email={email}
        setEmail={setEmail}
        handleInvite={handleInviteCollaborator}
        isInviting={isInviting}
      />
    </div>
  )
}

function InviteDialog({ isOpen, setIsOpen, email, setEmail, handleInvite, isInviting }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md w-[95vw] border-spotify-purple/20 bg-background">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="collaborator@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-spotify-purple/30 focus-visible:ring-spotify-purple"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-spotify-purple/30 hover:bg-spotify-purple/10 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isInviting}
              className="bg-spotify-purple hover:bg-spotify-purple-dark text-white w-full sm:w-auto"
            >
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
