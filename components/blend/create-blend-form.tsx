"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createNewBlend } from "@/app/actions/blend-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function CreateBlendForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      console.log("Form data:", Object.fromEntries(formData.entries()))

      const result = await createNewBlend(formData)

      if (result.error) {
        setError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Collaborative playlist created successfully!",
      })

      if (result.blendId) {
        router.push(`/blend/${result.blendId}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating blend:", error)
      setError("Failed to create collaborative playlist. Please try again.")
      toast({
        title: "Error",
        description: "Failed to create collaborative playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Playlist Name</Label>
        <Input id="name" name="name" placeholder="My Awesome Mix" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxParticipants">Max Participants</Label>
        <Input id="maxParticipants" name="maxParticipants" type="number" min="2" max="10" defaultValue="5" />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Collaborative Playlist"
        )}
      </Button>

      {error && (
        <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-md mt-2">{error}</div>
      )}
    </form>
  )
}
