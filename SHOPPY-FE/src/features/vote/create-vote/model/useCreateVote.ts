import { useState } from 'react';
import { normalizeApiError } from '@/shared/api/error';
import { createVote } from '@/entities/vote/api/voteApi';
import type { CreateVoteRequest, CreateVoteResponse } from '@/entities/vote/types/vote.types';

export const useCreateVote = () => {
  const [data, setData] = useState<CreateVoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const run = async (roomId: string, payload: CreateVoteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createVote(roomId, payload);
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
