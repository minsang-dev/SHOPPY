import type {
  JoinRoomRequest,
  JoinRoomResponse,
  RoomMember,
  RoomResponse,
} from '../types/room.types';
import { getRoom as fetchRoom, getRoomMembers as fetchRoomMembers, joinRoom as joinRoomApi, updateMemberState as updateMemberStateApi } from '../../../shared/api/rooms';

export const joinRoom = async (payload: JoinRoomRequest): Promise<JoinRoomResponse> => {
  const response = await joinRoomApi(payload);
  return response as JoinRoomResponse;
};

export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  const response = await fetchRoom(roomId);
  return response as RoomResponse;
};

export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
  const response = await fetchRoomMembers(roomId);
  return response as RoomMember[];
};

export const updateMemberState = async (
  roomId: string,
  memberId: number,
  isCameraOn: boolean,
): Promise<void> => {
  await updateMemberStateApi(roomId, memberId, { isCameraOn });
};
