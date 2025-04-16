import { getSession } from "@/lib/get-session"
import { getUserPlaylists } from "@/lib/db-actions"
import { LibraryHeader } from "@/components/library/library-header"
import { LibraryGrid } from "@/components/library/library-grid"
import { redirect } from "next/navigation"

export default async function LibraryPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const playlists = await getUserPlaylists(session.user.id)

  return (
    <div className="container py-6 space-y-8">
      <LibraryHeader />
      <LibraryGrid playlists={playlists} />
    </div>
  )
}
