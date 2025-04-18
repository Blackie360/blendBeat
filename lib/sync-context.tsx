"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

type SyncStatus = "idle" | "syncing" | "success" | "error"

interface SyncState {
  status: SyncStatus
  message: string
  lastSynced: Date | null
}

interface SyncContextType {
  syncState: SyncState
  startSync: (operation: string) => void
  finishSync: (success: boolean, message?: string) => void
  resetSync: () => void
}

const SyncContext = createContext<SyncContextType | undefined>(undefined)

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    message: "",
    lastSynced: null,
  })
  const { toast } = useToast()

  const startSync = (operation: string) => {
    setSyncState({
      status: "syncing",
      message: `Syncing ${operation} with Spotify...`,
      lastSynced: syncState.lastSynced,
    })
  }

  const finishSync = (success: boolean, message?: string) => {
    const newStatus = success ? "success" : "error"
    const newMessage = message || (success ? "Sync completed successfully" : "Sync failed")

    setSyncState({
      status: newStatus,
      message: newMessage,
      lastSynced: success ? new Date() : syncState.lastSynced,
    })

    // Show toast notification
    toast({
      title: success ? "Sync Successful" : "Sync Failed",
      description: newMessage,
      variant: success ? "default" : "destructive",
    })
  }

  const resetSync = () => {
    setSyncState({
      status: "idle",
      message: "",
      lastSynced: syncState.lastSynced,
    })
  }

  return <SyncContext.Provider value={{ syncState, startSync, finishSync, resetSync }}>{children}</SyncContext.Provider>
}

export function useSync() {
  const context = useContext(SyncContext)
  if (context === undefined) {
    throw new Error("useSync must be used within a SyncProvider")
  }
  return context
}
