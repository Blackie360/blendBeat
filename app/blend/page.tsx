import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getBlendsByUserId } from "@/lib/db"
import { redirect } from "next/navigation"
import { CreateBlendForm } from "@/components/blend/create-blend-form"
import { BlendList } from "@/components/blend/blend-list"
import { BackButton } from "@/components/navigation/back-button"

export default async function BlendPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Make sure we have the user ID
  const userId = session.user.id

  if (!userId) {
    console.error("User ID is missing from session")
    redirect("/login")
  }

  try {
    const blends = await getBlendsByUserId(userId)

    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Spotify Blends</h1>

        <div className="grid gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create a New Blend</h2>
            <CreateBlendForm />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Blends</h2>
            <BlendList blends={blends || []} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in blend page:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Spotify Blends</h1>
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-2">Error Loading Blends</h2>
          <p>There was an error loading your blends. Please try again later.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create a New Blend</h2>
          <CreateBlendForm />
        </div>
      </div>
    )
  }
}
