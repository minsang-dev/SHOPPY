import { apiGet, apiPost } from './utils';
import type { WebRTCQualityProfile, WebRTCSession } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

type RoomId = string | number;

export type WebRtcRole = 'PUBLISHER' | 'SUBSCRIBER';

export const stringifyWebRtcData = (data?: Record<string, unknown> | string) => {
  if (!data) {
    return undefined;
  }
  return typeof data === 'string' ? data : JSON.stringify(data);
};

const createMockWebRtcSession = (roomId: RoomId): WebRTCSession => ({
  sessionId: `mock-session-${roomId}`,
  token: `mock-token-${roomId}-${Date.now()}`,
  openViduUrl: 'https://mock-openvidu.local',
  maxParticipants: 10,
  iceServers: [],
});

export const createWebRtcSession = (
  roomId: RoomId,
  payload?: { role?: WebRtcRole; data?: Record<string, unknown> | string },
): Promise<WebRTCSession> => {
  if (USE_MOCK) {
    console.log('[Mock] createWebRtcSession:', { roomId, payload });
    return Promise.resolve(createMockWebRtcSession(roomId));
  }

  return apiPost<WebRTCSession>(`/rooms/${roomId}/webrtc/sessions`, {
    role: payload?.role,
    data: stringifyWebRtcData(payload?.data),
  });
};

export const recommendWebRtcQuality = (
  roomId: RoomId,
  payload: { rttMs: number; packetLossRatio: number; uplinkKbps: number },
) => apiPost<WebRTCQualityProfile>(`/rooms/${roomId}/webrtc/quality/recommendation`, payload);

export const listWebRtcProfiles = (roomId: RoomId) =>
  apiGet<WebRTCQualityProfile[]>(`/rooms/${roomId}/webrtc/quality/profiles`);
