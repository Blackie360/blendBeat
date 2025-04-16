"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { Music, Shuffle } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-black">
      <div className="absolute inset-0 bg-purple-glow opacity-30"></div>
      <Card className="w-full max-w-md relative z-10 animated-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-spotify-purple purple-glow">
              <Music className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl purple-gradient-text">Welcome to Spotify Blend</CardTitle>
          <CardDescription>Sign in with your Spotify account to create collaborative playlists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 text-sm border rounded-lg bg-muted/50 border-spotify-purple/20">
              <div className="flex items-center gap-2 mb-2">
                <Shuffle className="w-4 h-4 text-spotify-purple-light" />
                <span className="font-medium">Create Collaborative Playlists</span>
              </div>
              <p className="text-muted-foreground">
                Connect with friends or discover new music with random collaborators
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-spotify-purple hover:bg-spotify-purple-dark text-white transition-all duration-300"
            onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
          >
            Sign in with Spotify
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
