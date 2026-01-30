import { apiDelete, apiPatch, apiPost } from './utils';
// import { apiGet } from './utils';
import type { JoinRoomResponse, JoinRoomGuestResponse } from './types';
// import type { Member, Room } from './types';
import { mockRoom, mockMembers, createMockMember } from './mock/data';

type RoomId = string | number;

export type CreateRoomRequest = {
  roomName: string;
  targetBudget: number;
  roomMeta: {
    shoppingPurpose: string;
    interestCategories: string[];
    headcount: number;
    budgetMin: number;
  };
};

// ===== MOCK MODE (백엔드 서버 연결 시 아래 주석 해제하고 MOCK 코드 삭제) =====
export const createRoom = (payload: CreateRoomRequest) =>
  Promise.resolve({
    ...mockRoom,
    roomName: payload.roomName,
    targetBudget: payload.targetBudget,
    roomMeta: payload.roomMeta,
  });

export const getRoom = (roomId: RoomId) =>
  Promise.resolve({ ...mockRoom, roomId: Number(roomId) });

export const getRoomByCode = (roomCode: string) =>
  Promise.resolve({ ...mockRoom, inviteCode: roomCode });

export const joinRoomAsUser = (_payload: { roomCode: string }) => {
  const member = createMockMember('사용자', 'GUEST');
  return Promise.resolve(member as JoinRoomResponse);
};

export const joinRoomAsGuest = (payload: { roomCode: string; nickname: string }) => {
  const member = createMockMember(payload.nickname, 'GUEST');
  return Promise.resolve({
    member,
    accessToken: 'mock-access-token-12345',
  } as JoinRoomGuestResponse);
};

export const getRoomMembers = (_roomId: RoomId) =>
  Promise.resolve([...mockMembers]);

// ===== 원본 코드 (백엔드 연결 시 주석 해제) =====
// export const createRoom = (payload: CreateRoomRequest) =>
//   apiPost<Room>('/rooms', payload, true);

// export const getRoom = (roomId: RoomId) =>
//   apiGet<Room>(`/rooms/${roomId}`, undefined, true);

// export const getRoomByCode = (roomCode: string) =>
//   apiGet<Room>(`/rooms/code/${roomCode}`, undefined, true);

// // 로그인 사용자 방 참여 (roomCode만 필요)
// export const joinRoomAsUser = (payload: { roomCode: string }) =>
//   apiPost<JoinRoomResponse>('/rooms/join', payload, true);

// // 게스트 방 참여 (roomCode + nickname 필요)
// export const joinRoomAsGuest = (payload: { roomCode: string; nickname: string }) =>
//   apiPost<JoinRoomGuestResponse>('/rooms/join/guest', payload, false);

// export const getRoomMembers = (roomId: RoomId) =>
//   apiGet<Member[]>(`/rooms/${roomId}/members`, undefined, true);

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
