import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function SearchPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Search</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-spotify-purple" />
            Search for Music
          </CardTitle>
          <CardDescription>Find your favorite songs, artists, and playlists</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is coming soon. Check back later for updates!</p>
        </CardContent>
      </Card>
    </div>
  )
}
