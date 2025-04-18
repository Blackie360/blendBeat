"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Camera } from "lucide-react"
import html2canvas from "html2canvas"
// Import the trackShareAnalytics utility
import { trackShareAnalytics } from "@/lib/analytics-utils"

interface StoryShareProps {
  playlistId: string
  playlistName: string
  playlistImage?: string
  trackCount?: number
  ownerName?: string
  onShare?: () => void
}

export function StoryShare({
  playlistId,
  playlistName,
  playlistImage = "/placeholder.svg",
  trackCount = 0,
  ownerName = "Spotify User",
  onShare,
}: StoryShareProps) {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const storyRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Add this function before the handleDownload function
  const trackStoryShare = (action: string) => {
    trackShareAnalytics(playlistId, "story", action)
  }

  // Update the handleDownload function to track analytics
  const handleDownload = async () => {
    if (!storyRef.current) return

    setIsGenerating(true)

    try {
      const canvas = await html2canvas(storyRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      })

      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `${playlistName.replace(/\s+/g, "-").toLowerCase()}-story.png`
      link.click()

      toast({
        title: "Story downloaded",
        description: "Your story image has been downloaded",
      })

      // Track the story download
      trackStoryShare("download")
    } catch (error) {
      console.error("Error generating story:", error)
      toast({
        title: "Error generating story",
        description: "There was a problem creating your story image",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInstagramShare = () => {
    // Track analytics
    trackStoryShare("instagram")

    // Call the onShare callback if provided
    if (onShare) {
      onShare()
    }

    toast({
      title: "Instagram sharing",
      description: "In a production app, this would open Instagram sharing",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            trackStoryShare("instagram")
          }}
        >
          <Camera className="w-4 h-4 mr-2" />
          Create Story
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share as Story</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div
            ref={storyRef}
            className="w-[320px] h-[568px] bg-gradient-to-br from-spotify-purple-dark to-black rounded-lg overflow-hidden relative p-6 flex flex-col"
          >
            {/* Story content */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-48 h-48 relative mb-6">
                <img
                  src={playlistImage || "/placeholder.svg"}
                  alt={playlistName}
                  className="w-full h-full object-cover shadow-lg"
                />
              </div>

              <h2 className="text-xl font-bold text-white text-center mb-2">{playlistName}</h2>
              <p className="text-sm text-gray-300 text-center mb-4">
                {trackCount} tracks • Created by {ownerName}
              </p>

              <div className="bg-spotify-purple rounded-full px-4 py-2 text-white text-sm font-medium">
                Listen on Spotify
              </div>
            </div>

            {/* Spotify logo */}
            <div className="absolute bottom-6 right-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                  fill="#1DB954"
                />
                <path
                  d="M16.7461 16.5C16.5991 16.5 16.4521 16.45 16.3341 16.35C14.4991 15.03 12.2341 14.37 9.73414 14.37C8.51414 14.37 7.26414 14.53 6.04414 14.84C5.78414 14.91 5.52414 14.75 5.45414 14.49C5.38414 14.23 5.54414 13.97 5.80414 13.9C7.12414 13.56 8.48414 13.39 9.73414 13.39C12.4641 13.39 14.9641 14.12 16.9941 15.58C17.2241 15.74 17.2741 16.05 17.1141 16.28C17.0241 16.42 16.8841 16.5 16.7461 16.5Z"
                  fill="white"
                />
                <path
                  d="M17.9801 13.73C17.8101 13.73 17.6401 13.67 17.5101 13.54C15.3101 11.85 12.2201 10.92 8.80008 10.92C7.34008 10.92 5.88008 11.11 4.45008 11.5C4.15008 11.58 3.84008 11.4 3.76008 11.1C3.68008 10.8 3.86008 10.49 4.16008 10.41C5.70008 9.99 7.25008 9.78 8.80008 9.78C12.5401 9.78 15.9601 10.79 18.4501 12.68C18.7201 12.88 18.7701 13.26 18.5701 13.53C18.4601 13.66 18.2201 13.73 17.9801 13.73Z"
                  fill="white"
                />
                <path
                  d="M19.3581 10.5C19.1881 10.5 19.0181 10.44 18.8881 10.31C16.2981 8.32 12.2781 7.18 8.48809 7.18C6.81809 7.18 5.12809 7.36 3.48809 7.73C3.18809 7.8 2.87809 7.62 2.80809 7.32C2.73809 7.02 2.91809 6.71 3.21809 6.64C4.94809 6.25 6.70809 6.05 8.48809 6.05C12.5481 6.05 16.8581 7.27 19.8281 9.52C20.0981 9.72 20.1481 10.1 19.9481 10.37C19.8281 10.46 19.5981 10.5 19.3581 10.5Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 bg-spotify-purple hover:bg-spotify-purple-dark"
            >
              {isGenerating ? "Generating..." : "Download Story"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
