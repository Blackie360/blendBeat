import { Skeleton } from "@/components/ui/skeleton"

export function TrackSkeleton() {
  return (
    <div className="border rounded-lg border-spotify-purple/20 bg-gradient-to-br from-background to-spotify-purple-dark/5">
      <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4 text-sm text-muted-foreground border-b border-spotify-purple/20">
        <div className="w-8 text-center">#</div>
        <div>Title</div>
        <div>Duration</div>
        <div className="w-8"></div>
      </div>

      <div className="hidden md:block divide-y divide-spotify-purple/10">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4">
              <div className="w-8 text-center">
                <Skeleton className="h-5 w-5 mx-auto" />
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-10 w-10 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
              <div className="w-8">
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
      </div>

      <div className="md:hidden divide-y divide-spotify-purple/10">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex flex-col p-3 border-b border-spotify-purple/10 last:border-b-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="ml-13 mt-1">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
