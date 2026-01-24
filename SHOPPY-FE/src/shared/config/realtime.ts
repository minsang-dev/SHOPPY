export const realtimeConfig = {
  websocketUrl: import.meta.env.VITE_WEBSOCKET_URL ?? '',
  signalingUrl: import.meta.env.VITE_WEBRTC_SIGNALING_URL ?? '',
  enabled: import.meta.env.VITE_REALTIME_ENABLED === 'true',
} as const;
