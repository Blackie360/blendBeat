import {
  getUserProfile as getUserProfileApi,
  createSpotifyPlaylist as createSpotifyPlaylistApi,
  addTracksToSpotifyPlaylist as addTracksToSpotifyPlaylistApi,
  removeTracksFromSpotifyPlaylist as removeTracksFromSpotifyPlaylistApi,
} from "./spotify-api"

// Re-export the required functions
export const getUserProfile = getUserProfileApi
export const createSpotifyPlaylist = createSpotifyPlaylistApi
export const addTracksToSpotifyPlaylist = addTracksToSpotifyPlaylistApi
export const removeTracksFromSpotifyPlaylist = removeTracksFromSpotifyPlaylistApi

// Export other functions that might be needed
export * from "./spotify-api"
