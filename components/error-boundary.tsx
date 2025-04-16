"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const errorHandler = (event) => {
      event.preventDefault()
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", errorHandler)
    }
  }, [])

  // Reset error state when session changes
  useEffect(() => {
    if (session) {
      setHasError(false)
    }
  }, [session])

  if (hasError) {
    return fallback
  }

  return children
}
