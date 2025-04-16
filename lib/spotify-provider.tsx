"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

const SpotifyContext = createContext(null)

export function SpotifyProvider({ children }) {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (session?.accessToken) {
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }
  }, [session])

  return <SpotifyContext.Provider value={{ isConnected }}>{children}</SpotifyContext.Provider>
}

export function useSpotify() {
  const context = useContext(SpotifyContext)

  if (!context) {
    throw new Error("useSpotify must be used within a SpotifyProvider")
  }

  return context
}
