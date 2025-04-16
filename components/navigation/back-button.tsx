"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 hover:bg-spotify-purple/10"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </Button>
  )
}
