"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Library, Plus, Search, Shuffle } from "lucide-react"

export function MobileBottomNav() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
    },
    {
      label: "Create",
      icon: Plus,
      href: "/playlist/create",
    },
    {
      label: "Library",
      icon: Library,
      href: "/library",
    },
    {
      label: "Blend",
      icon: Shuffle,
      href: "/blend",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-spotify-purple/20 md:hidden mobile-safe-bottom">
      <div className="flex items-center justify-around h-16">
        {routes.map((route) => {
          const isActive = pathname === route.href

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive ? "text-spotify-purple" : "text-muted-foreground",
              )}
            >
              <route.icon className={cn("w-5 h-5", isActive && "text-spotify-purple")} />
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
