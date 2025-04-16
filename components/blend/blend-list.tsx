import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Blend {
  id: number
  name: string
  playlist_id: string | null
  max_participants: number
  is_active: boolean
  created_at: string
  expires_at: string | null
}

interface BlendListProps {
  blends: Blend[]
}

export function BlendList({ blends }: BlendListProps) {
  if (blends.length === 0) {
    return <div className="text-center py-8 text-gray-500">You haven't created any blends yet.</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {blends.map((blend) => (
        <Link key={blend.id} href={`/blend/${blend.id}`}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{blend.name}</CardTitle>
                {blend.is_active ? (
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    Inactive
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                Created {formatDistanceToNow(new Date(blend.created_at), { addSuffix: true })}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm">Max participants: {blend.max_participants}</div>
                {blend.playlist_id ? (
                  <Badge variant="outline" className="text-blue-500">
                    Playlist linked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-500">
                    No playlist
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
