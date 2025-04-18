import type { NextAuthOptions } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import { sql } from "@neondatabase/serverless"

const scopes = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-top-read",
].join(" ")

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: { scope: scopes },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.id = profile?.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.expiresAt = token.expiresAt as number
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        // Check if user exists
        const existingUser = await sql`
          SELECT * FROM users WHERE id = ${user.id || profile?.id}
        `

        const userData = {
          id: user.id || profile?.id,
          email: user.email,
          name: user.name || profile?.display_name || "Spotify User",
          image: user.image || profile?.images?.[0]?.url,
          spotify_id: profile?.id,
          created_at: "CURRENT_TIMESTAMP",
          updated_at: "CURRENT_TIMESTAMP",
        }

        if (existingUser.rows.length === 0) {
          // Create new user
          await sql`
            INSERT INTO users (id, email, name, image, spotify_id, created_at, updated_at)
            VALUES (
              ${userData.id},
              ${userData.email},
              ${userData.name},
              ${userData.image},
              ${userData.spotify_id},
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            )
          `
          console.log("Created new user:", user.email)
        } else {
          // Update existing user with all available data
          await sql`
            UPDATE users
            SET 
              email = ${userData.email},
              name = ${userData.name},
              image = ${userData.image},
              spotify_id = ${userData.spotify_id},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userData.id}
          `
          console.log("Updated existing user:", user.email)
        }

        return true
      } catch (error) {
        console.error("Error saving user to database:", error)
        // Still allow sign in even if database save fails
        return true
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Export the auth function
export const auth = async () => {
  const session = await getServerSession(authOptions)
  return session
}

// Export the getSession function
export const getSession = async () => {
  const session = await getServerSession(authOptions)
  return session
}

import { getServerSession } from "next-auth/next"
