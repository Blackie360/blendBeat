"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"

export function DashboardError() {
  const { data: session } = useSession()
  const [retryCount, setRetryCount] = useState(0)

  // Function to handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    window.location.reload()
  }

  // If we have a session, don't show the "Return to Login" button
  const isAuthenticated = !!session

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md border-amber-500/20 bg-amber-500/5">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Dashboard Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            We're having trouble loading your dashboard data. This might be a temporary issue.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry ({retryCount})
          </Button>

          {!isAuthenticated && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Return to Login</Link>
            </Button>
          )}

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
