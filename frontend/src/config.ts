export const config = {
  RADIO_STREAM_URL: import.meta.env.VITE_RADIO_STREAM_URL || "", // Empty if not configured
  LIVE_VIDEO_URL: import.meta.env.VITE_LIVE_VIDEO_URL || "", // Empty if not configured
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api"
};
