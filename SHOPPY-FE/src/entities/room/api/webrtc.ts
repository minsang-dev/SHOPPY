import { createWebRtcSession, listWebRtcProfiles, recommendWebRtcQuality, stringifyWebRtcData, type WebRtcRole } from '../../../shared/api/webrtc';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface JoinWebrtcSessionRequest {
  role: WebRtcRole;
  data: string;
}

export interface JoinWebrtcSessionResponse {
  sessionId: string;
  token: string;
  openViduUrl: string;
  maxParticipants: number;
  iceServers: RTCIceServer[];
}

export interface WebrtcQualityRequest {
  rttMs: number;
  packetLossRatio: number;
  uplinkKbps: number;
}

export interface WebrtcQualityProfile {
  name: string;
  width: number;
  height: number;
  maxFps: number;
  maxBitrateKbps: number;
}

const createMockWebrtcSession = (roomId: string): JoinWebrtcSessionResponse => ({
  sessionId: `mock-session-${roomId}`,
  token: `mock-token-${roomId}-${Date.now()}`,
  openViduUrl: 'https://mock-openvidu.local',
  maxParticipants: 10,
  iceServers: [],
});

export const joinWebrtcSession = async (
  roomId: string,
  payload: JoinWebrtcSessionRequest,
  _accessToken?: string,
): Promise<JoinWebrtcSessionResponse> => {
  if (USE_MOCK) {
    console.log('[Mock] joinWebrtcSession:', { roomId, payload });
    return createMockWebrtcSession(roomId);
  }

  const response = await createWebRtcSession(roomId, {
    role: payload.role,
    data: stringifyWebRtcData(payload.data),
  });
  return response as JoinWebrtcSessionResponse;
};

export const getWebrtcQualities = async (roomId: string, _accessToken?: string) => {
  const response = await listWebRtcProfiles(roomId);
  return response as WebrtcQualityProfile[];
};

export const setWebrtcQuality = async (
  roomId: string,
  payload: WebrtcQualityRequest,
  _accessToken?: string,
) => {
  const response = await recommendWebRtcQuality(roomId, payload);
  return response as WebrtcQualityProfile;
};
