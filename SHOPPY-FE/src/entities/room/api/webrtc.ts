import type {
  JoinWebrtcSessionRequest,
  JoinWebrtcSessionResponse,
  WebrtcQualityRequest,
  WebrtcQualityProfile,
  ApiResponse,
} from '../types/webrtc.types';

const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL ?? '';

const buildHeaders = (accessToken: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${accessToken}`,
});

export const joinWebrtcSession = async (
  roomId: string,
  payload: JoinWebrtcSessionRequest,
  accessToken: string,
) => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/rooms/${roomId}/webrtc/sessions`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to join webrtc session');
  }
  const json: ApiResponse<JoinWebrtcSessionResponse> = await response.json();
  return json.data;
};

export const getWebrtcQualities = async (roomId: string, accessToken: string) => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/rooms/${roomId}/webrtc/quality/profiles`, {
    method: 'GET',
    headers: buildHeaders(accessToken),
  });
  if (!response.ok) {
    throw new Error('Failed to load webrtc qualities');
  }
  const json: ApiResponse<WebrtcQualityProfile[]> = await response.json();
  return json.data;
};

export const setWebrtcQuality = async (
  roomId: string,
  payload: WebrtcQualityRequest,
  accessToken: string,
) => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/rooms/${roomId}/webrtc/quality/recommendation`,
    {
      method: 'POST',
      headers: buildHeaders(accessToken),
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error('Failed to set webrtc quality');
  }
  const json: ApiResponse<WebrtcQualityProfile> = await response.json();
  return json.data;
};
