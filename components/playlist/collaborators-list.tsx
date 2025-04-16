"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, UserMinus, UserPlus } from "lucide-react"
import { removeCollaborator, addCollaborator } from "@/lib/db-actions"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function CollaboratorsList({ collaborators, playlistId }) {
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(playlistId, userId)

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
      await addCollaborator(playlistId, email)

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      })

      setEmail("")
      setIsOpen(false)
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

  if (!collaborators || collaborators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-spotify-purple/20 bg-spotify-purple-dark/10">
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
    <div className="space-y-4">
      {collaborators.map((user) => (
        <div
          key={user.id || user.user_id}
          className="flex items-center justify-between p-3 border rounded-lg border-spotify-purple/20 bg-spotify-purple-dark/5 hover:bg-spotify-purple-dark/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
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
      <DialogContent className="sm:max-w-md border-spotify-purple/20 bg-background">
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
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isInviting}
              className="bg-spotify-purple hover:bg-spotify-purple-dark text-white"
            >
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
