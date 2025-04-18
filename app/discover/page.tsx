import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getFeaturedPlaylists, getCategories } from "@/lib/spotify-service"
import { BackButton } from "@/components/navigation/back-button"
import { FeaturedPlaylists } from "@/components/discover/featured-playlists"
import { CategoryList } from "@/components/discover/category-list"

export default async function DiscoverPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  try {
    // Fetch featured playlists and categories in parallel
    const [featuredData, categoriesData] = await Promise.all([getFeaturedPlaylists(), getCategories()])

    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Discover</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{featuredData.message || "Featured Playlists"}</h2>
          <FeaturedPlaylists playlists={featuredData.playlists.items} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
          <CategoryList categories={categoriesData.categories.items} />
        </section>
      </div>
    )
  } catch (error) {
    console.error("Error in discover page:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Discover</h1>
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
          <p>There was an error loading discover content. Please try again later.</p>
        </div>
      </div>
    )
  }
}
