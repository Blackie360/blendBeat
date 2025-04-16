import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import type { NextAuthOptions } from "next-auth"

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

        if (profile) {
          token.id = profile.id
          token.spotifyId = profile.id
        }
      }

      if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
        return token
      }

      try {
        return await refreshAccessToken(token)
      } catch (error) {
        console.error("Error refreshing access token", error)
        return { ...token, error: "RefreshAccessTokenError" }
      }
    },
    async session({ session, token }) {
      try {
        session.accessToken = token.accessToken
        session.error = token.error

        if (session.user) {
          session.user.id = token.id as string
          session.user.spotifyId = token.spotifyId as string
        }

        return session
      } catch (error) {
        console.error("Error in session callback", error)
        return session
      }
    },
    async signIn({ user, account, profile }) {
      try {
        if (user && account && profile) {
          //console.log("signIn callback", { user, account, profile })
        }
        return true
      } catch (error) {
        console.error("Error in signIn callback", error)
        return true
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}

async function refreshAccessToken(token) {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw data
    }

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + data.expires_in),
    }
  } catch (error) {
    console.error("Error refreshing token:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

// For NextAuth.js v4
export default NextAuth(authOptions)

// For compatibility with different versions
export const auth = () => {
  try {
    return NextAuth(authOptions).auth()
  } catch (error) {
    console.error("Auth function error:", error)
    return null
  }
}

export async function getSession() {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}
