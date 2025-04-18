"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { MessageCircle, Send, X, Search, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Import the trackShareAnalytics utility
import { trackShareAnalytics } from "@/lib/analytics-utils"

interface DirectMessageShareProps {
  playlistId: string
  playlistName: string
  onShare?: () => void
}

// Mock user data - in a real app, this would come from your API
const mockUsers = [
  { id: "1", name: "Jane Smith", image: "/colorful-abstract-shapes.png" },
  { id: "2", name: "John Doe", image: "/colorful-abstract-shapes.png" },
  { id: "3", name: "Alex Johnson", image: "/abstract-geometric-shapes.png" },
  { id: "4", name: "Sam Wilson", image: "/abstract-geometric-shapes.png" },
  { id: "5", name: "Taylor Swift", image: "/abstract-geometric-shapes.png" },
]

export function DirectMessageShare({ playlistId, playlistName, onShare }: DirectMessageShareProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  // Filter users based on search query
  const filteredUsers = mockUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Track share analytics
  // const trackShareAnalytics = async () => {
  //   try {
  //     await fetch("/api/share/analytics", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         playlistId,
  //         shareType: "direct_message",
  //         platform: "internal",
  //       }),
  //     });
  //   } catch (error) {
  //     console.error("Error tracking share analytics:", error);
  //   }
  // };

  // Update the handleSend function to track analytics
  const handleSend = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // Track the direct message share
    trackShareAnalytics(playlistId, "direct_message", `recipients_${selectedUsers.length}`)

    // In a real app, you would send this to your backend
    setTimeout(() => {
      setIsSending(false)
      toast({
        title: "Message sent",
        description: `Shared with ${selectedUsers.length} recipient(s)`,
      })
      setOpen(false)
      setSelectedUsers([])
      setMessage("")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          Direct Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share via Direct Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Search for friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
            </div>

            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((userId) => {
                  const user = mockUsers.find((u) => u.id === userId)
                  if (!user) return null

                  return (
                    <div
                      key={userId}
                      className="flex items-center gap-1 bg-spotify-purple/20 text-spotify-purple rounded-full px-3 py-1 text-sm"
                    >
                      <span>{user.name}</span>
                      <button
                        onClick={() => toggleUserSelection(userId)}
                        className="text-spotify-purple hover:text-spotify-purple-dark"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-md">
            {filteredUsers.length > 0 ? (
              <ul className="divide-y">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted ${
                      selectedUsers.includes(user.id) ? "bg-spotify-purple/10" : ""
                    }`}
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>

                    {selectedUsers.includes(user.id) && <div className="h-2 w-2 rounded-full bg-spotify-purple"></div>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No users found</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message (optional)</label>
            <Textarea
              placeholder={`Check out this playlist: ${playlistName}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="bg-spotify-purple hover:bg-spotify-purple-dark"
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
