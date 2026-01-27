import { createWebRtcSession, listWebRtcProfiles, recommendWebRtcQuality, stringifyWebRtcData, type WebRtcRole } from '../../../shared/api/webrtc';

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

export const joinWebrtcSession = async (
  roomId: string,
  payload: JoinWebrtcSessionRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _accessToken?: string,
): Promise<JoinWebrtcSessionResponse> => {
  const response = await createWebRtcSession(roomId, {
    role: payload.role,
    data: stringifyWebRtcData(payload.data),
  });
  return response as JoinWebrtcSessionResponse;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getWebrtcQualities = async (roomId: string, _accessToken?: string) => {
  const response = await listWebRtcProfiles(roomId);
  return response as WebrtcQualityProfile[];
};

export const setWebrtcQuality = async (
  roomId: string,
  payload: WebrtcQualityRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _accessToken?: string,
) => {
  const response = await recommendWebRtcQuality(roomId, payload);
  return response as WebrtcQualityProfile;
};
