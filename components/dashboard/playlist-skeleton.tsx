import { Skeleton } from "@/components/ui/skeleton"

export function PlaylistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4 md:gap-6">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 md:p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="p-3 pt-0 md:p-4 md:pt-0">
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
    </div>
  )
}
