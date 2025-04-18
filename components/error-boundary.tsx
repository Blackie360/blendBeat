"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="p-4 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
        {fallback || (
          <>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="mb-4">There was an error loading this content.</p>
          </>
        )}
        <Button onClick={() => setHasError(false)}>Try again</Button>
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
