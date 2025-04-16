import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with your database URL
const sql = neon(process.env.DATABASE_URL!)

// Create a Drizzle client using the SQL client
export const db = drizzle(sql)

// Helper function for raw SQL queries when needed
export async function executeQuery(query: string, params: any[] = []) {
  try {
    return await sql(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
