import { useState, useEffect, useCallback } from 'react';
import { normalizeApiError } from '@/shared/api/error';
import { getVoteList } from '@/entities/vote/api/voteApi';
import type { Vote } from '@/entities/vote/types/vote.types';

export const useVoteList = (roomId: string | undefined, status: 'OPEN' | 'CLOSED' = 'OPEN') => {
  const [data, setData] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const fetchVoteList = useCallback(async () => {
    if (!roomId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const votes = await getVoteList(roomId, status);
      setData(votes);
    } catch (e) {
      const normalized = normalizeApiError(e);
      setError(normalized);
      console.error('투표 목록 조회 실패:', normalized);
    } finally {
      setLoading(false);
    }
  }, [roomId, status]);

  useEffect(() => {
    fetchVoteList();
  }, [fetchVoteList]);

  return { data, loading, error, refetch: fetchVoteList };
};
