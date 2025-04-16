"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createNewBlend } from "@/app/actions/blend-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function CreateBlendForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      console.log("Form data:", Object.fromEntries(formData.entries()))

      const result = await createNewBlend(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Blend created successfully!",
      })

      if (result.blendId) {
        router.push(`/blend/${result.blendId}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating blend:", error)
      toast({
        title: "Error",
        description: "Failed to create blend. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Blend Name</Label>
        <Input id="name" name="name" placeholder="My Awesome Blend" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxParticipants">Max Participants</Label>
        <Input id="maxParticipants" name="maxParticipants" type="number" min="2" max="10" defaultValue="5" />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Blend"}
      </Button>
    </form>
  )
}
