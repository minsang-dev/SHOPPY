import axios from 'axios';
import type { Participant } from '../types/participant.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 방의 참여자 목록을 조회하는 API
 * @param roomId 방 ID
 * @returns 참여자 목록
 */
export const getMemberList = async (roomId: string): Promise<Participant[]> => {
  const url = `${API_BASE_URL}/api/rooms/${roomId}/members/member_list`;
  const response = await axios.get<Participant[]>(url);
  return response.data;
};
