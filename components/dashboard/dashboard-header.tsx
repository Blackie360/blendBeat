import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Shuffle } from "lucide-react"

export function DashboardHeader({ user }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 pb-4 border-b border-spotify-purple/20 md:flex-row md:items-center">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border border-spotify-purple/30 purple-glow">
          <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className="bg-spotify-purple/20">{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold purple-gradient-text">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="border-spotify-purple/30 hover:bg-spotify-purple/10">
          <Link href="/playlist/create">
            <Plus className="w-4 h-4 mr-2" /> New Playlist
          </Link>
        </Button>
        <Button asChild className="bg-spotify-purple hover:bg-spotify-purple-dark text-white">
          <Link href="/blend">
            <Shuffle className="w-4 h-4 mr-2" /> Create Blend
          </Link>
        </Button>
      </div>
    </div>
  )
}
