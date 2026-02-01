import type {
  CreateRoomRequest,
  CreateRoomResponse,
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
