"use client"

import { useEffect, useState } from "react"

export function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)

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

  if (hasError) {
    return fallback
  }

  return children
}
