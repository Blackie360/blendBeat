"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const { status } = useSession()

  useEffect(() => {
    // Reset error state when session status changes
    setHasError(false)
  }, [status])

  if (hasError) {
    return (
      <div>
        {fallback}
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
          onClick={() => setHasError(false)}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div
      onError={(e) => {
        console.error("Error caught by ErrorBoundary:", e)
        setHasError(true)
      }}
    >
      {children}
    </div>
  )
}
