"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

interface ShareAnalytics {
  share_type: string
  platform: string
  count: number
}

interface ShareAnalyticsProps {
  playlistId: string
}

export function ShareAnalytics({ playlistId }: ShareAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/share/analytics?playlistId=${playlistId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch share analytics")
        }

        const data = await response.json()
        setAnalytics(data.analytics || [])
      } catch (err) {
        console.error("Error fetching share analytics:", err)
        setError("Failed to load share analytics")
        toast({
          title: "Error",
          description: "Failed to load share analytics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [playlistId, toast])

  // Process data for charts
  const shareTypeData = analytics.reduce(
    (acc, item) => {
      const existingItem = acc.find((i) => i.name === item.share_type)
      if (existingItem) {
        existingItem.value += Number(item.count)
      } else {
        acc.push({ name: item.share_type, value: Number(item.count) })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  const platformData = analytics
    .filter((item) => item.platform)
    .reduce(
      (acc, item) => {
        const existingItem = acc.find((i) => i.name === item.platform)
        if (existingItem) {
          existingItem.value += Number(item.count)
        } else {
          acc.push({ name: item.platform, value: Number(item.count) })
        }
        return acc
      },
      [] as { name: string; value: number }[],
    )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-spotify-purple animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (analytics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Share Analytics</CardTitle>
          <CardDescription>Track how your playlist is being shared</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">No sharing activity recorded yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Analytics</CardTitle>
        <CardDescription>Track how your playlist is being shared</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="shareType">
          <TabsList className="mb-4">
            <TabsTrigger value="shareType">Share Types</TabsTrigger>
            <TabsTrigger value="platform">Platforms</TabsTrigger>
          </TabsList>

          <TabsContent value="shareType">
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  value: {
                    label: "Count",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shareTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="var(--color-value)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="platform">
            <div className="h-[300px]">
              {platformData.length > 0 ? (
                <ChartContainer
                  config={{
                    value: {
                      label: "Count",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="var(--color-value)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">No platform data available</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
