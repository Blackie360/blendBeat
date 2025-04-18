import { NextResponse } from "next/server"
import { sql } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    // Get user data from headers
    const userId = request.headers.get("x-user-id")
    const userEmail = request.headers.get("x-user-email")
    const userName = request.headers.get("x-user-name")
    const userImage = request.headers.get("x-user-image")

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `

    if (existingUser.rows.length === 0) {
      // Create new user
      await sql`
        INSERT INTO users (id, email, name, image, spotify_id, created_at, updated_at)
        VALUES (
          ${userId},
          ${userEmail},
          ${userName || "Spotify User"},
          ${userImage || null},
          ${userId}, -- Using userId as spotify_id as a fallback
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `
      console.log("Created missing user:", userEmail)
    } else {
      // Update user data to ensure it's current
      await sql`
        UPDATE users
        SET 
          email = ${userEmail},
          name = ${userName || existingUser.rows[0].name},
          image = ${userImage || existingUser.rows[0].image},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
      console.log("Updated existing user:", userEmail)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error ensuring user in database:", error)
    return NextResponse.json({ error: "Failed to ensure user in database" }, { status: 500 })
  }
}
