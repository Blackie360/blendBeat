"use client"

import Link from "next/link"
import { Music } from "lucide-react"

export function MobileNav() {
  return (
    <div className="md:hidden mobile-safe-top">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Music className="w-6 h-6 text-spotify-purple" />
          <span className="text-xl font-bold purple-gradient-text">Spotify Blend</span>
        </Link>
      </div>
    </div>
  )
}
