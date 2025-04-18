"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface SyncBadgeProps {
  playlistId: string
  lastSynced: string | null
  syncStatus: string
  className?: string
}

export function SyncBadge({ playlistId, lastSynced, syncStatus, className }: SyncBadgeProps) {
  const [status, setStatus] = useState(syncStatus || "unknown")
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(lastSynced ? new Date(lastSynced) : null)

  // Format the last synced time
  const formattedLastSynced = lastSyncTime ? formatDistanceToNow(lastSyncTime, { addSuffix: true }) : "never"

  // Determine badge color and icon based on status
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline"
  let icon = <Clock className="h-3 w-3 mr-1" />
  let tooltipText = `Last synced ${formattedLastSynced}`

  if (status === "synced") {
    badgeVariant = "default"
    icon = <CheckCircle2 className="h-3 w-3 mr-1" />
    tooltipText = `In sync with Spotify (last synced ${formattedLastSynced})`
  } else if (status === "out_of_sync") {
    badgeVariant = "secondary"
    icon = <Clock className="h-3 w-3 mr-1" />
    tooltipText = `Out of sync with Spotify (last synced ${formattedLastSynced})`
  } else if (status === "error") {
    badgeVariant = "destructive"
    icon = <AlertCircle className="h-3 w-3 mr-1" />
    tooltipText = `Sync error (last synced ${formattedLastSynced})`
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={badgeVariant} className={`${className} cursor-help`}>
            {icon}
            <span className="text-xs">
              {status === "synced" ? "Synced" : status === "out_of_sync" ? "Out of sync" : "Sync error"}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
