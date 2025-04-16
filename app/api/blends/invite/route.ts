import { NextResponse } from "next/server"
import { getSession } from "@/lib/get-session"
import { joinBlend } from "@/lib/db-actions"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { blendId, userId } = await request.json()

    if (!blendId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add the user to the blend
    await joinBlend(blendId, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error inviting user to blend:", error)
    return NextResponse.json({ error: error.message || "Failed to invite user to blend" }, { status: 500 })
  }
}
