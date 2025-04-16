"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ErrorBoundary } from "@/components/error-boundary"
import { getUserProfile, getUserPlaylists, getUserTopTracks, getUserTopArtists } from "@/lib/spotify-service"
import { getBlendsByUserId } from "@/lib/db"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  try {
    // Fetch all data in parallel
    const [userProfile, userPlaylists, topTracks, topArtists, blends] = await Promise.all([
      getUserProfile().catch((error) => {
        console.error("Error fetching user profile:", error)
        return null
      }),
      getUserPlaylists(session.user.id).catch((error) => {
        console.error("Error fetching user playlists:", error)
        return { items: [] }
      }),
      getUserTopTracks().catch((error) => {
        console.error("Error fetching top tracks:", error)
        return { items: [] }
      }),
      getUserTopArtists().catch((error) => {
        console.error("Error fetching top artists:", error)
        return { items: [] }
      }),
      getBlendsByUserId(session.user.id).catch((error) => {
        console.error("Error fetching blends:", error)
        return []
      }),
    ])

    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader user={userProfile || session.user} />

        <ErrorBoundary fallback={<p>Something went wrong loading the dashboard content.</p>}>
          <DashboardContent
            playlists={userPlaylists?.items || []}
            topTracks={topTracks?.items || []}
            topArtists={topArtists?.items || []}
            blends={blends || []}
          />
        </ErrorBoundary>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p>There was an error loading your dashboard. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
}
