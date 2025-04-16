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

  const blends = await getBlendsByUserId(session.user.id)

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
          <BlendList blends={blends} />
        </div>
      </div>
    </div>
  )
}
