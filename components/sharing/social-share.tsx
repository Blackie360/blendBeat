"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Facebook, Twitter, Linkedin, Mail, Share2, Copy, Check, PhoneIcon as WhatsApp } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
// Import the trackShareAnalytics utility
import { trackShareAnalytics } from "@/lib/analytics-utils"

interface SocialShareProps {
  url: string
  title: string
  description?: string
  image?: string
  trigger?: React.ReactNode
}

export function SocialShare({ url, title, description, image, trigger }: SocialShareProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"social" | "email" | "qrcode">("social")
  const [email, setEmail] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Extract playlist ID from URL for analytics
  const playlistId = url.split("/").pop() || ""

  // Track share analytics
  // Replace the existing trackShareAnalytics function with this:
  const trackShare = async (platform: string) => {
    try {
      // Extract the playlist ID from the URL
      const playlistId = url.split("/").pop() || ""
      await trackShareAnalytics(playlistId, "social", platform)
    } catch (error) {
      console.error("Error tracking share analytics:", error)
    }
  }

  // Social media share URLs
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`
  const emailBody = `${customMessage ? customMessage + "\n\n" : ""}${description || title}\n\n${url}`
  const emailSubject = title

  // Handle social media sharing
  // Update the social media share functions to use the new utility
  const handleTwitterShare = () => {
    trackShare("twitter")
    window.open(twitterUrl, "_blank")
  }

  const handleFacebookShare = () => {
    trackShare("facebook")
    window.open(facebookUrl, "_blank")
  }

  const handleLinkedInShare = () => {
    trackShare("linkedin")
    window.open(linkedinUrl, "_blank")
  }

  const handleWhatsAppShare = () => {
    trackShare("whatsapp")
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    // Track email share
    trackShare("email")

    // In a real app, you would send this to your backend
    // For now, we'll just open the mailto link
    window.open(
      `mailto:${email}?subject=${emailSubject}&body=${encodeURIComponent(customMessage || "")}%0A%0A${emailBody}`,
      "_blank",
    )

    toast({
      title: "Email share initiated",
      description: `Sharing with ${email}`,
    })

    setEmail("")
    setCustomMessage("")
    setOpen(false)
  }

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    trackShareAnalytics("copy_link")

    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  // Default trigger if none provided
  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>Share this playlist with friends and followers</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === "social" ? "border-b-2 border-spotify-purple font-medium" : ""}`}
            onClick={() => setActiveTab("social")}
          >
            Social
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "email" ? "border-b-2 border-spotify-purple font-medium" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            Email
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "qrcode" ? "border-b-2 border-spotify-purple font-medium" : ""}`}
            onClick={() => setActiveTab("qrcode")}
          >
            QR Code
          </button>
        </div>

        {activeTab === "social" && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-0"
              onClick={() => handleTwitterShare()}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-0"
              onClick={() => handleFacebookShare()}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white border-0"
              onClick={() => handleLinkedInShare()}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-0"
              onClick={() => handleWhatsAppShare()}
            >
              <WhatsApp className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" className="col-span-2" onClick={handleCopyLink}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy Link
            </Button>
          </div>
        )}

        {activeTab === "email" && (
          <form onSubmit={handleEmailShare} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Check out this playlist I found!"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-spotify-purple hover:bg-spotify-purple-dark">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </form>
        )}

        {activeTab === "qrcode" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={url} size={200} />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Scan this QR code with your phone camera to open the playlist
            </p>
            <Button
              variant="outline"
              onClick={() => {
                // Create a canvas element
                const canvas = document.createElement("canvas")
                const qrCode = document.querySelector(".react-qr-svg")
                if (qrCode) {
                  const svgData = new XMLSerializer().serializeToString(qrCode as SVGElement)
                  const img = new Image()
                  img.onload = () => {
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext("2d")
                    if (ctx) {
                      ctx.fillStyle = "white"
                      ctx.fillRect(0, 0, canvas.width, canvas.height)
                      ctx.drawImage(img, 0, 0)

                      // Download the image
                      const link = document.createElement("a")
                      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qrcode.png`
                      link.href = canvas.toDataURL("image/png")
                      link.click()

                      trackShareAnalytics("qrcode_download")
                    }
                  }
                  img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
                }
              }}
            >
              Download QR Code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
