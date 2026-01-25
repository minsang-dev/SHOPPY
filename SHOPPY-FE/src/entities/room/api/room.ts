import axios from 'axios';
import type {
  JoinRoomRequest,
  JoinRoomResponse,
  RoomMember,
  RoomResponse,
} from '../types/room.types';

interface SuccessResponse<T> {
  status: string;
  message: string;
  data: T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const joinRoom = async (payload: JoinRoomRequest): Promise<JoinRoomResponse> => {
  const response = await axios.post<SuccessResponse<JoinRoomResponse>>(
    `${API_BASE_URL}/rooms/join`,
    payload,
  );

  return response.data.data;
};

export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  const response = await axios.get<SuccessResponse<RoomResponse>>(
    `${API_BASE_URL}/rooms/${roomId}`,
  );
  return response.data.data;
};

export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
  const response = await axios.get<SuccessResponse<RoomMember[]>>(
    `${API_BASE_URL}/rooms/${roomId}/members`,
  );
  return response.data.data;
};

export const updateMemberState = async (
  roomId: string,
  memberId: number,
  isCameraOn: boolean,
): Promise<void> => {
  await axios.patch(
    `${API_BASE_URL}/rooms/${roomId}/members/${memberId}`,
    { isCameraOn },
  );
};
