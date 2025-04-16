import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-10 w-10 text-spotify-purple animate-spin" />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  )
}
