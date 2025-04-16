import { getSession } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { getBlendById } from "@/lib/db-actions"
import { BlendDetails } from "@/components/blend/blend-details"
import { BlendShare } from "@/components/blend/blend-share"

export default async function BlendPage({ params }) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const blend = await getBlendById(params.id)

  if (!blend) {
    redirect("/blend")
  }

  return (
    <div className="container py-6 space-y-8">
      <BlendDetails blend={blend} />
      <BlendShare blend={blend} />
    </div>
  )
}
