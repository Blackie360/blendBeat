import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SpotifyProvider } from "@/lib/spotify-provider"
import { AuthProvider } from "@/lib/auth-provider"
import { SyncProvider } from "@/lib/sync-context"
import "./globals.css"

export const metadata = {
  title: "Spotify Playlist Builder",
  description: "Create and manage collaborative Spotify playlists",
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
              <SyncProvider>
                <div className="min-h-screen pb-16 md:pb-0">
                  {children}
                  <Toaster />
                </div>
              </SyncProvider>
            </SpotifyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
