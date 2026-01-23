import axios from 'axios';
import type { Participant } from '../types/participant.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 방의 참여자 목록을 조회하는 API
 * @returns 참여자 목록
 */
export const getMemberList = async (): Promise<Participant[]> => {
  const url = `${API_BASE_URL}/api/rooms/members/member_list`;
  const response = await axios.get<Participant[]>(url);
  return response.data;
};
