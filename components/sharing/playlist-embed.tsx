"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { trackShareAnalytics } from "@/lib/analytics-utils"

interface PlaylistEmbedProps {
  playlistId: string
  width?: number
  height?: number
}

export function PlaylistEmbed({ playlistId, width = 300, height = 380 }: PlaylistEmbedProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Generate embed codes
  const iframeCode = `<iframe src="https://open.spotify.com/embed/playlist/${playlistId}" width="${width}" height="${height}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`

  const urlCode = `https://open.spotify.com/playlist/${playlistId}`

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Embed code copied successfully",
    })

    // Track the embed analytics
    trackShareAnalytics(playlistId, "embed", type)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="preview">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="iframe">Embed Code</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex justify-center p-4 border rounded-md">
          <iframe
            src={`https://open.spotify.com/embed/playlist/${playlistId}`}
            width={width}
            height={height}
            frameBorder="0"
            allowTransparency={true}
            allow="encrypted-media"
            className="max-w-full"
          />
        </TabsContent>

        <TabsContent value="iframe" className="space-y-2">
          <Textarea value={iframeCode} readOnly rows={4} className="font-mono text-sm" />
          <div className="flex justify-end">
            <Button onClick={() => handleCopy(iframeCode, "iframe")} variant="outline" size="sm">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy embed code
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-2">
          <Textarea value={urlCode} readOnly rows={2} className="font-mono text-sm" />
          <div className="flex justify-end">
            <Button onClick={() => handleCopy(urlCode, "url")} variant="outline" size="sm">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy URL
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
