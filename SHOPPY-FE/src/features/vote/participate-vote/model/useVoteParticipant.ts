import { useState } from 'react';
import { normalizeApiError } from '@/shared/api/error';
import { participateVote } from '@/entities/vote/api/voteApi';
import type { VoteParticipantRequest, VoteParticipantResponse } from '@/entities/vote/types/vote.types';

export const useVoteParticipant = () => {
  const [data, setData] = useState<VoteParticipantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const run = async (
    roomId: string,
    voteId: number,
    payload: VoteParticipantRequest,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await participateVote(roomId, voteId, payload);
      setData(response);
      return response;
    } catch (e) {
      const normalized = normalizeApiError(e);
      setError(normalized);
      throw normalized;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, run };
};
