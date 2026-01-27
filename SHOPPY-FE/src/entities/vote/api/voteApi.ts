import axios from 'axios';
import type {
  Vote,
  VoteDetail,
  VoteParticipantRequest,
  VoteParticipantResponse,
  CreateVoteRequest,
  CreateVoteResponse,
} from '../types/vote.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 투표 목록 조회
export const getVoteList = async (
  roomId: string,
  status: 'OPEN' | 'CLOSED' = 'OPEN',
): Promise<Vote[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/rooms/${roomId}/votes`,
    {
      params: { status },
    },
  );
  return response.data.data.items;
};

// 투표 상세 조회
export const getVoteDetail = async (
  roomId: string,
  voteId: number,
): Promise<VoteDetail> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/rooms/${roomId}/votes/${voteId}`,
  );
  return response.data.data;
};

// 투표 참여
export const participateVote = async (
  roomId: string,
  voteId: number,
  payload: VoteParticipantRequest,
): Promise<VoteParticipantResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/rooms/${roomId}/votes/${voteId}/participants`,
    payload,
  );
  return response.data.data;
};

// 투표 생성
export const createVote = async (
  roomId: string,
  payload: CreateVoteRequest,
): Promise<CreateVoteResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/rooms/${roomId}/votes`,
    payload,
  );
  return response.data.data;
};
