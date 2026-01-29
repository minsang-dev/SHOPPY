import type {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomAsUserRequest,
  JoinRoomAsGuestRequest,
  JoinRoomResponse,
  JoinRoomAsGuestResponse,
  RoomMember,
  RoomResponse,
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

// 편의 joinRoom (deprecated, nickname이 있으면 게스트, 없으면 로그인 사용자)
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

// 참여자 상태 업데이트
export const updateMemberState = async (
  roomId: string,
  memberId: number,
  isCameraOn: boolean,
): Promise<void> => {
  await updateMemberStateApi(roomId, memberId, { isCameraOn });
};
