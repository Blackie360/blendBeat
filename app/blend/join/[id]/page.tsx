import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getBlendById, joinBlend } from "@/lib/db-actions"

export default async function JoinBlendPage({ params }) {
  const session = await getSession()

  if (!session?.user) {
    redirect(`/login?callbackUrl=/blend/join/${params.id}`)
  }

  try {
    // Check if the blend exists
    const blend = await getBlendById(params.id)

    if (!blend) {
      redirect("/blend?error=blend-not-found")
    }

    // Join the blend
    await joinBlend(params.id, session.user.id)

    // Redirect to the blend page
    redirect(`/blend/${params.id}?joined=true`)
  } catch (error) {
    console.error("Error joining blend:", error)
    redirect(`/blend?error=${encodeURIComponent(error.message)}`)
  }
}
