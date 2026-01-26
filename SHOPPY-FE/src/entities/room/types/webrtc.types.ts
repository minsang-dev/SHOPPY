export interface JoinWebrtcSessionRequest {
  role: 'PUBLISHER' | 'SUBSCRIBER';
  data: string;
}

export interface JoinWebrtcSessionResponse {
  sessionId: string;
  token: string;
  openviduUrl: string;
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

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
