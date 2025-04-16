import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json({ message: "Path is required" }, { status: 400 })
    }

    revalidatePath(path)

    return NextResponse.json({ revalidated: true, path })
  } catch (error) {
    console.error("Error revalidating path:", error)
    return NextResponse.json({ message: "Failed to revalidate" }, { status: 500 })
  }
}
