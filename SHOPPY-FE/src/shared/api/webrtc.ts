import { apiGet, apiPost } from './utils';
import type { WebRTCQualityProfile, WebRTCSession } from './types';

type RoomId = string | number;

export type WebRtcRole = 'PUBLISHER' | 'SUBSCRIBER';

export const stringifyWebRtcData = (data?: Record<string, unknown> | string) => {
  if (!data) {
    return undefined;
  }
  return typeof data === 'string' ? data : JSON.stringify(data);
};

export const createWebRtcSession = (
  roomId: RoomId,
  payload?: { role?: WebRtcRole; data?: Record<string, unknown> | string },
) =>
  apiPost<WebRTCSession>(`/rooms/${roomId}/webrtc/sessions`, {
    role: payload?.role,
    data: stringifyWebRtcData(payload?.data),
  });

export const recommendWebRtcQuality = (
  roomId: RoomId,
  payload: { rttMs: number; packetLossRatio: number; uplinkKbps: number },
) => apiPost<WebRTCQualityProfile>(`/rooms/${roomId}/webrtc/quality/recommendation`, payload);

export const listWebRtcProfiles = (roomId: RoomId) =>
  apiGet<WebRTCQualityProfile[]>(`/rooms/${roomId}/webrtc/quality/profiles`);
