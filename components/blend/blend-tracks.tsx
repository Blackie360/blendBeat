"use client"

import { useState } from "react"
import { formatDistance } from "date-fns"

interface Track {
  track: {
    id: string
    name: string
    artists: Array<{ name: string }>
    album: {
      name: string
      images: Array<{ url: string }>
    }
    uri: string
    external_urls: {
      spotify: string
    }
  }
  added_at: string
  added_by: {
    id: string
    display_name?: string
  }
}

interface BlendTracksProps {
  tracks: Track[]
}

export function BlendTracks({ tracks }: BlendTracksProps) {
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent")

  if (!tracks || tracks.length === 0) {
    return <div className="text-center py-8 text-gray-500">No tracks in this blend yet.</div>
  }

  const sortedTracks = [...tracks].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
    } else {
      return a.track.name.localeCompare(b.track.name)
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-muted-foreground">{tracks.length} tracks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
            className="text-sm bg-transparent border rounded px-2 py-1"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <ul className="space-y-2">
        {sortedTracks.map((item) => (
          <li
            key={`${item.track.id}-${item.added_at}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.track.album.images[0]?.url || "/placeholder.svg"}
                alt={item.track.album.name}
                className="h-12 w-12 rounded"
              />
              <div>
                <a
                  href={item.track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  {item.track.name}
                </a>
                <div className="text-sm text-muted-foreground">{item.track.artists.map((a) => a.name).join(", ")}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <span>Added {formatDistance(new Date(item.added_at), new Date(), { addSuffix: true })}</span>
                  {item.added_by?.display_name && (
                    <>
                      <span>•</span>
                      <span>by {item.added_by.display_name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <a
              href={item.track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-600"
            >
              Play on Spotify
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
