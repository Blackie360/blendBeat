import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SpotifyProvider } from "@/lib/spotify-provider"
import { AuthProvider } from "@/lib/auth-provider"
import "./globals.css"

export const metadata = {
  title: "Spotify Blend - Collaborative Playlist Creator",
  description: "Create and manage collaborative Spotify playlists with friends or random collaborators",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <SpotifyProvider>
              {children}
              <Toaster />
            </SpotifyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'