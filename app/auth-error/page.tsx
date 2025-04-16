"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    // Log the error for debugging
    if (error) {
      console.error("Authentication error:", error)
    }
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>{error ? `Error: ${error}` : "There was a problem signing you in."}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This could be due to expired credentials or a configuration issue. Please try again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full bg-spotify-purple hover:bg-spotify-purple-dark"
            onClick={() => router.push("/login")}
          >
            Try Again
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
