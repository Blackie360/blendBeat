"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface SyncButtonProps {
  playlistId: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SyncButton({ playlistId, className, variant = "outline", size = "sm" }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()
  const router = useRouter()

  const handleSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    setSyncStatus("idle")

    try {
      const response = await fetch(`/api/playlists/${playlistId}/force-sync`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to sync playlist")
      }

      const result = await response.json()

      setSyncStatus("success")
      toast({
        title: "Playlist Synced",
        description: result.message || `Playlist synced with ${result.trackCount} tracks from Spotify`,
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("Error syncing playlist:", error)
      setSyncStatus("error")
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync playlist with Spotify",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)

      // Reset success/error status after 3 seconds
      if (syncStatus !== "idle") {
        setTimeout(() => {
          setSyncStatus("idle")
        }, 3000)
      }
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} variant={variant} size={size} className={className}>
      {isSyncing ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : syncStatus === "success" ? (
        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
      ) : syncStatus === "error" ? (
        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-2" />
      )}
      {isSyncing ? "Syncing..." : "Sync with Spotify"}
    </Button>
  )
}
