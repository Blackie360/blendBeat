import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/db-actions"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border border-spotify-purple/30 purple-glow">
              <AvatarImage src={user?.image || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback className="bg-spotify-purple/20">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Profile settings and additional features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  )
}
