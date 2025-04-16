"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Home, Library, LogOut, Music, Search, Shuffle, User } from "lucide-react"
import { signOut } from "next-auth/react"
import { MobileNav } from "./mobile-nav"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
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
      label: "Your Library",
      icon: Library,
      href: "/library",
      active: pathname === "/library",
    },
    {
      label: "Create Blend",
      icon: Shuffle,
      href: "/blend",
      active: pathname === "/blend",
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
  ]

  return (
    <>
      <MobileNav />
      <div className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-50 border-r border-spotify-purple/20">
        <div className="flex items-center h-16 px-6 border-b border-spotify-purple/20">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Music className="w-6 h-6 text-spotify-purple" />
            <span className="text-xl font-bold purple-gradient-text">Spotify Blend</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant="ghost"
                className={cn("w-full justify-start transition-all duration-200", {
                  "bg-spotify-purple/20 text-spotify-purple-light": route.active,
                })}
              >
                <Link href={route.href}>
                  <route.icon
                    className={cn("w-5 h-5 mr-3", {
                      "text-spotify-purple-light": route.active,
                    })}
                  />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-spotify-purple/20">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-white hover:bg-spotify-purple/10"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log Out
          </Button>
        </div>
      </div>
    </>
  )
}
