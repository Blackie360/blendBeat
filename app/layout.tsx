import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SpotifyProvider } from "@/lib/spotify-provider"
import { AuthProvider } from "@/lib/auth-provider"
import { MobileNavWrapper } from "@/components/dashboard/mobile-nav-wrapper"
import "./globals.css"

export const metadata = {
  title: "Spotify Blend - Collaborative Playlist Creator",
  description: "Create and manage collaborative Spotify playlists with friends or random collaborators",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <SpotifyProvider>
              <div className="min-h-screen pb-16 md:pb-0">
                {children}
                <MobileNavWrapper />
              </div>
              <Toaster />
            </SpotifyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'