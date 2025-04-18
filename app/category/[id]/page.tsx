import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getCategoryPlaylists } from "@/lib/spotify-service"
import { BackButton } from "@/components/navigation/back-button"
import { FeaturedPlaylists } from "@/components/discover/featured-playlists"

export default async function CategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  try {
    const categoryId = params.id
    const categoryData = await getCategoryPlaylists(categoryId)

    if (!categoryData) {
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">{categoryData.message || categoryId}</h1>

        <section>
          <FeaturedPlaylists playlists={categoryData.playlists.items} />
        </section>
      </div>
    )
  } catch (error) {
    console.error("Error in category page:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Category</h1>
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Error Loading Category</h2>
          <p>There was an error loading this category. Please try again later.</p>
        </div>
      </div>
    )
  }
}
