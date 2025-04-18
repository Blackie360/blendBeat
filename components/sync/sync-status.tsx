"use client"

import { useSync } from "@/lib/sync-context"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SyncStatusProps {
  className?: string
  showLastSynced?: boolean
  showRefresh?: boolean
  onRefresh?: () => Promise<void>
}

export function SyncStatus({ className, showLastSynced = true, showRefresh = false, onRefresh }: SyncStatusProps) {
  const { syncState, resetSync } = useSync()
  const { status, message, lastSynced } = syncState

  const handleRefresh = async () => {
    if (onRefresh && status !== "syncing") {
      await onRefresh()
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {status === "syncing" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-spotify-purple" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-500">{message}</span>
        </>
      )}

      {status === "idle" && showLastSynced && lastSynced && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground">
                Last synced {formatDistanceToNow(lastSynced, { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last synchronized with Spotify on {lastSynced.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {showRefresh && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleRefresh}
          disabled={status === "syncing"}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      )}
    </div>
  )
}
