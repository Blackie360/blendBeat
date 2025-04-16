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
      active: pathname === "/dashboard",
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
      active: pathname === "/search",
    },
    {
      label: "Create",
      icon: Plus,
      href: "/playlist/create",
      active: pathname === "/playlist/create",
    },
    {
      label: "Library",
      icon: Library,
      href: "/library",
      active: pathname === "/library",
    },
    {
      label: "Blend",
      icon: Shuffle,
      href: "/blend",
      active: pathname === "/blend",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-spotify-purple/20 md:hidden mobile-safe-bottom">
      <div className="flex items-center justify-around h-16">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              route.active ? "text-spotify-purple" : "text-muted-foreground",
            )}
          >
            <route.icon className={cn("w-5 h-5", route.active && "text-spotify-purple")} />
            <span className="text-xs mt-1">{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
