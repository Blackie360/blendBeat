import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export function DashboardError() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md border-red-500/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            There was an error loading your dashboard. Please try again later.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/dashboard">Retry</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
