import { apiDelete, apiGet, apiPatch, apiPost } from './utils';
import type { JoinRoomResponse, Member, Room } from './types';

type RoomId = string | number;

export type CreateRoomRequest = {
  roomName: string;
  targetBudget: number;
  syncMode: string;
  roomMeta: {
    shoppingPurpose: string;
    interestCategories: string[];
    headcount: number;
    budgetMin: number;
  };
};

export const createRoom = (payload: CreateRoomRequest) =>
  apiPost<Room>('/rooms', payload, true);

export const getRoom = (roomId: RoomId) =>
  apiGet<Room>(`/rooms/${roomId}`, undefined, true);

export const getRoomByCode = (roomCode: string) =>
  apiGet<Room>(`/rooms/code/${roomCode}`, undefined, true);

// 로그인 사용자 방 참여 (roomCode만 필요)
export const joinRoomAsUser = (payload: { roomCode: string }) =>
  apiPost<JoinRoomResponse>('/rooms/join', payload, true);

// 게스트 방 참여 (roomCode + nickname 필요)
export const joinRoomAsGuest = (payload: { roomCode: string; nickname: string }) =>
  apiPost<JoinRoomResponse>('/rooms/join/guest', payload, false);

export const getRoomMembers = (roomId: RoomId) =>
  apiGet<Member[]>(`/rooms/${roomId}/members`, undefined, true);

export const leaveRoom = (roomId: RoomId, memberId: number) =>
  apiDelete<void>(`/rooms/${roomId}/members/${memberId}`, undefined, true);

export const updateMyMemberState = (
  roomId: RoomId,
  payload: { currentUrl: string },
) => apiPatch<void>(`/rooms/${roomId}/members/me`, payload, true);

export const updateMemberState = (
  roomId: RoomId,
  memberId: number,
  payload: { isCameraOn: boolean },
) => apiPatch<void>(`/rooms/${roomId}/members/${memberId}`, payload, true);

export const closeRoom = (roomId: RoomId) => apiPost<void>(`/rooms/${roomId}/close`, undefined, true);
