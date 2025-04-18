/**
 * Utility function to track share analytics
 * @param playlistId The ID of the playlist being shared
 * @param shareType The type of share (social, embed, direct, etc.)
 * @param platform The platform used for sharing (twitter, facebook, iframe, etc.)
 */
export async function trackShareAnalytics(playlistId: string, shareType: string, platform?: string): Promise<void> {
  try {
    await fetch("/api/share/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlistId,
        shareType,
        platform,
      }),
    })

    console.log(`Share analytics tracked: ${shareType} on ${platform || "unknown"}`)
  } catch (error) {
    console.error("Error tracking share analytics:", error)
    // Don't throw the error to avoid disrupting the user experience
  }
}
