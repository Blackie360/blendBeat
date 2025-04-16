import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Library } from "lucide-react"

export default function LibraryPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Library</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-spotify-purple" />
            Your Music Collection
          </CardTitle>
          <CardDescription>Access your saved songs, playlists, and albums</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is coming soon. Check back later for updates!</p>
        </CardContent>
      </Card>
    </div>
  )
}
