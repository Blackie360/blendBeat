import { NextResponse } from "next/server"
import { getSession } from "@/lib/get-session"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "5", 10)

    // Get random users excluding the current user
    const query = `
      SELECT id, name, email, image
      FROM users
      WHERE id != $1
      ORDER BY RANDOM()
      LIMIT $2
    `

    const users = await executeQuery(query, [session.user.id, limit])

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error getting random users:", error)
    return NextResponse.json({ error: error.message || "Failed to get random users" }, { status: 500 })
  }
}
