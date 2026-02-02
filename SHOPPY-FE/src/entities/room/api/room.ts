import type {
  CreateRoomRequest,
  CreateRoomResponse,
  CreateRoomWithAIRequest,
  CreateRoomWithAIResponse,
  JoinRoomAsUserRequest,
  JoinRoomAsGuestRequest,
  JoinRoomResponse,
  JoinRoomAsGuestResponse,
  RoomMember,
  RoomResponse,
  SyncMode,
} from '../types/room.types';
import { apiRequest } from '@/shared/api/http';
import { updateMemberState as updateMemberStateApi } from '@/shared/api/rooms';

// 방 생성
export const createRoom = async (payload: CreateRoomRequest): Promise<CreateRoomResponse> => {
  return apiRequest<CreateRoomResponse>({
    method: 'POST',
    url: '/rooms',
    data: payload,
  });
};

// 방 생성 + AI 장바구니 생성 (LLM 요청)
// LLM 응답이 오래 걸릴 수 있으므로 타임아웃을 60초로 설정
export const createRoomWithAI = async (payload: CreateRoomWithAIRequest): Promise<CreateRoomWithAIResponse> => {
  return apiRequest<CreateRoomWithAIResponse>({
    method: 'POST',
    url: '/rooms/ai/LLM',
    data: payload,
    config: {
      timeout: 60000, // 60초
    },
  });
};

// 로그인 사용자 방 입장
export const joinRoomAsUser = async (payload: JoinRoomAsUserRequest): Promise<JoinRoomResponse> => {
  return apiRequest<JoinRoomResponse>({
    method: 'POST',
    url: '/rooms/join',
    data: payload,
  });
};

// 게스트 방 입장 (인증 불필요)
export const joinRoomAsGuest = async (payload: JoinRoomAsGuestRequest): Promise<JoinRoomAsGuestResponse> => {
  return apiRequest<JoinRoomAsGuestResponse>({
    method: 'POST',
    url: '/rooms/join/guest',
    data: payload,
    auth: false,
  });
};

// 로그인 사용자 방 입장 
export const joinRoom = async (payload: { roomCode: string; nickname?: string }): Promise<JoinRoomResponse> => {
  if (payload.nickname) {
    const guestRes = await joinRoomAsGuest({ roomCode: payload.roomCode, nickname: payload.nickname });
    return guestRes.member;
  } else {
    return await joinRoomAsUser({ roomCode: payload.roomCode });
  }
};

// 방 조회
export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  return apiRequest<RoomResponse>({
    method: 'GET',
    url: `/rooms/${roomId}`,
  });
};

// 방 코드로 방 조회
export const getRoomByCode = async (roomCode: string): Promise<RoomResponse> => {
  return apiRequest<RoomResponse>({
    method: 'GET',
    url: `/rooms/code/${roomCode}`,
  });
};

// 참여자 목록 조회
export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
  return apiRequest<RoomMember[]>({
    method: 'GET',
    url: `/rooms/${roomId}/members`,
  });
};

// 방 나가기
export const leaveRoom = async (roomId: string): Promise<void> => {
  await apiRequest<void>({
    method: 'DELETE',
    url: `/rooms/${roomId}/leave`,
  });
};

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * unload(탭 닫기/새로고침) 시 leave 처리.
 * 1) sendBeacon으로 POST /rooms/{roomId}/leave/beacon (body: { accessToken })
 * 2) 실패 시 fetch keepalive로 DELETE /rooms/{roomId}/leave (Authorization)
 */
export const sendLeaveOnUnload = (roomId: string, token?: string): void => {
  const baseUrl = getBaseUrl();
  const leaveUrl = `${baseUrl}/rooms/${roomId}/leave`;
  const beaconUrl = `${baseUrl}/rooms/${roomId}/leave/beacon`;

  // 1) Beacon 호출 시도
  const tryBeacon = (): boolean => {
    // 브라우저가 이 기능을 지원하는지, 토큰이 있는지 확인
    if (typeof navigator?.sendBeacon !== 'function' || !token?.trim()) return false;
    // sendBeacon은 일반적인 JSON 객체를 바로 못 보냄. 데이터를 파일처럼 다룰 수 있는 Blob로 포장
    const payload = new Blob([JSON.stringify({ accessToken: token.trim() })], {
      type: 'application/json',
    });
    return navigator.sendBeacon(beaconUrl, payload);
  };
  // 2) fetch 호출 시도(Beacon 실패 시)
  const fallbackFetch = (): void => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      void fetch(leaveUrl, { method: 'DELETE', headers, keepalive: true });
    } catch {
      // 실패해도 어쩔 수 없음 (이미 떠나는 중이라 에러 띄울 필요 없음)
    }
  };

  if (!tryBeacon()) fallbackFetch();
};

// 개인 동기화 모드 변경 (멤버 본인의 FOLLOW/FREE 전환)
export const patchSyncMode = async (
  roomId: string,
  payload: { syncMode: SyncMode },
): Promise<void> => {
  await apiRequest<void>({
    method: 'PATCH',
    url: `/rooms/${roomId}/sync-mode`,
    data: payload,
  });
};

// 호스트 URL 업데이트
export const patchHostUrl = async (
  roomId: string,
  payload: { currentUrl: string },
): Promise<void> => {
  await apiRequest<void>({
    method: 'PATCH',
    url: `/rooms/${roomId}/host-url`,
    data: payload,
  });
};

// 참여자 상태 업데이트
export const updateMemberState = async (
  roomId: string,
  memberId: number,
  isCameraOn: boolean,
): Promise<void> => {
  await updateMemberStateApi(roomId, memberId, { isCameraOn });
};
