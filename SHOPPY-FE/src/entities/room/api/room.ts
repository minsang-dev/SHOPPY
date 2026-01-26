import axios from 'axios';
import type {
  CreateRoomRequest,
  CreateRoomResponse,
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

// 호스트 방 생성
export const createRoom = async (payload: CreateRoomRequest): Promise<CreateRoomResponse> => {
  const response = await axios.post<SuccessResponse<CreateRoomResponse>>(
    `${API_BASE_URL}/api/rooms`,
    payload,
  );

  return response.data.data;
};

// 게스트 방 입장
export const joinRoom = async (payload: JoinRoomRequest): Promise<JoinRoomResponse> => {
  const response = await axios.post<SuccessResponse<JoinRoomResponse>>(
    `${API_BASE_URL}/api/rooms/join`,
    payload,
  );

  return response.data.data;
};

// 호스트 방 조회
export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  const response = await axios.get<SuccessResponse<RoomResponse>>(
    `${API_BASE_URL}/api/rooms/${roomId}`,
  );
  return response.data.data;
};

// 참여자 목록 조회
export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
  const response = await axios.get<SuccessResponse<RoomMember[]>>(
    `${API_BASE_URL}/api/rooms/${roomId}/members`,
  );
  return response.data.data;
};

// 참여자 상태 업데이트
export const updateMemberState = async (
  roomId: string,
  memberId: number,
  isCameraOn: boolean,
): Promise<void> => {
  await axios.patch(
    `${API_BASE_URL}/api/rooms/${roomId}/members/${memberId}`,
    { isCameraOn },
  );
};
