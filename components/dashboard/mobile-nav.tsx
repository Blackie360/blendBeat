"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Library, LogOut, Menu, Music, Search, Shuffle, User } from "lucide-react"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
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
    <div className="md:hidden mobile-safe-top">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Music className="w-6 h-6 text-spotify-purple" />
          <span className="text-xl font-bold purple-gradient-text">Spotify Blend</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-background border-r border-spotify-purple/20 p-0">
            <div className="flex items-center h-16 px-6 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Music className="w-6 h-6 text-spotify-purple" />
                <span className="text-xl font-bold purple-gradient-text">Spotify Blend</span>
              </Link>
            </div>

            <div className="py-4 px-2">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    asChild
                    variant="ghost"
                    className={cn("w-full justify-start", {
                      "bg-spotify-purple/20 text-spotify-purple-light": route.active,
                    })}
                    onClick={() => setOpen(false)}
                  >
                    <Link href={route.href}>
                      <route.icon className="w-5 h-5 mr-3" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Log Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
