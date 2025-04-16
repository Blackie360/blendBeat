"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FaSpotify } from "react-icons/fa"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Spotify Blend</CardTitle>
          <CardDescription>Sign in with your Spotify account to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-6 text-center">
            <p className="mb-2">Create custom blend playlists by combining tracks from your library and other users.</p>
            <p className="text-sm text-muted-foreground">You'll need a Spotify account to use this application.</p>
          </div>
          <Button
            onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
            className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 text-white"
          >
            <FaSpotify className="mr-2 h-5 w-5" />
            Sign in with Spotify
          </Button>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          By signing in, you agree to allow this application to access your Spotify account information and playlists.
        </CardFooter>
      </Card>
    </div>
  )
}
