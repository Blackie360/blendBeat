import { MusicIcon } from "lucide-react"

export function LibraryHeader() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>

      <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-spotify-purple/20 to-spotify-purple-dark/10 border border-spotify-purple/20">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-spotify-purple/20">
          <MusicIcon className="w-5 h-5 text-spotify-purple-light" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Your Music Collection</h2>
          <p className="text-muted-foreground">Access your saved songs, playlists, and albums</p>
        </div>
      </div>
    </div>
  )
}
