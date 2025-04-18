"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Music } from "lucide-react"
import { motion } from "framer-motion"

interface Category {
  id: string
  name: string
  icons: Array<{ url: string }>
}

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {categories.map((category) => (
        <motion.div
          key={category.id}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={() => setHoveredId(category.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Link href={`/category/${category.id}`}>
            <Card className="overflow-hidden aspect-square relative hover:shadow-md transition-all duration-200">
              {category.icons?.[0]?.url ? (
                <Image
                  src={category.icons[0].url || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Music className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              {/* Overlay with category name */}
              <div
                className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${hoveredId === category.id ? "opacity-100" : "opacity-0"}`}
              >
                <h3 className="text-white font-bold text-center px-2">{category.name}</h3>
              </div>

              {/* Always visible name at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h3 className="text-white font-medium text-sm">{category.name}</h3>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
