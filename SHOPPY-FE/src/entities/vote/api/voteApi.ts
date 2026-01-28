import { apiGet, apiPost } from '@/shared/api/utils';
import type {
  Vote,
  VoteDetail,
  VoteParticipantRequest,
  VoteParticipantResponse,
  CreateVoteRequest,
  CreateVoteResponse,
} from '../types/vote.types';

// 투표 목록 조회
export const getVoteList = async (
  roomId: string,
  status: 'OPEN' | 'CLOSED' = 'OPEN',
): Promise<Vote[]> => {
  const response = await apiGet<{ items: Vote[] }>(
    `/rooms/${roomId}/votes`,
    { status },
  );
  return response.items;
};

// 투표 상세 조회
export const getVoteDetail = async (
  roomId: string,
  voteId: number,
): Promise<VoteDetail> => {
  return apiGet<VoteDetail>(`/rooms/${roomId}/votes/${voteId}`);
};

// 투표 참여
export const participateVote = async (
  roomId: string,
  voteId: number,
  payload: VoteParticipantRequest,
): Promise<VoteParticipantResponse> => {
  return apiPost<VoteParticipantResponse>(
    `/rooms/${roomId}/votes/${voteId}/participants`,
    payload,
  );
};

// 투표 생성
export const createVote = async (
  roomId: string,
  payload: CreateVoteRequest,
): Promise<CreateVoteResponse> => {
  return apiPost<CreateVoteResponse>(`/rooms/${roomId}/votes`, payload);
};

// 투표 마감
export const closeVote = async (
  roomId: string,
  voteId: number,
): Promise<void> => {
  return apiPost<void>(`/rooms/${roomId}/votes/${voteId}/close`);
};
