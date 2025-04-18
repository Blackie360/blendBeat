"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Loader2 } from "lucide-react"
import { uploadPlaylistCoverImage } from "@/lib/client-spotify"
import Image from "next/image"

interface PlaylistCoverUploadProps {
  playlistId: string
  currentImageUrl?: string
}

export function PlaylistCoverUpload({ playlistId, currentImageUrl }: PlaylistCoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 256KB for Spotify)
    if (file.size > 256 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 256KB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Convert to base64 and upload
      const base64 = await convertFileToBase64(file)
      await uploadPlaylistCoverImage(playlistId, base64)

      toast({
        title: "Cover image updated",
        description: "Your playlist cover has been updated",
      })
    } catch (error) {
      console.error("Error uploading cover image:", error)
      toast({
        title: "Error",
        description: "Failed to upload cover image",
        variant: "destructive",
      })
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Extract base64 data
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: "none" }} />
      {previewUrl ? (
        <Image
          src={previewUrl || "/placeholder.svg"}
          alt="Playlist Cover Preview"
          width={128}
          height={128}
          className="rounded-md"
        />
      ) : currentImageUrl ? (
        <Image
          src={currentImageUrl || "/placeholder.svg"}
          alt="Current Playlist Cover"
          width={128}
          height={128}
          className="rounded-md"
        />
      ) : (
        <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <Button variant="outline" className="mt-2" onClick={handleButtonClick} disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload New Cover"
        )}
      </Button>
    </div>
  )
}
