import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  display_name?: string
  followers?: { total: number }
  images?: Array<{ url: string }>
  product?: string
}

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const displayName = user.display_name || user.name || "Spotify User"
  const imageUrl = user.images?.[0]?.url || user.image || "/vibrant-street-market.png"
  const followerCount = user.followers?.total || 0
  const accountType = user.product ? user.product.charAt(0).toUpperCase() + user.product.slice(1) : "Free"

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
      <Avatar className="h-24 w-24">
        <AvatarImage src={imageUrl || "/placeholder.svg"} alt={displayName} />
        <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold">{displayName}</h1>
        <div className="text-muted-foreground mt-1">
          {followerCount > 0 && <span className="mr-4">{followerCount} followers</span>}
          <span>{accountType} account</span>
        </div>
        <p className="mt-2">Welcome to your Spotify Blend dashboard!</p>
      </div>
    </div>
  )
}
