import { useState, useEffect, useCallback } from 'react';
import { normalizeApiError } from '@/shared/api/error';
import { getVoteDetail } from '@/entities/vote/api/voteApi';
import type { VoteDetail } from '@/entities/vote/types/vote.types';

export const useVoteDetail = (roomId: string | undefined, voteId: number | null) => {
  const [data, setData] = useState<VoteDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const fetchVoteDetail = useCallback(async () => {
    if (!roomId || !voteId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const voteDetail = await getVoteDetail(roomId, voteId);
      setData(voteDetail);
    } catch (e) {
      const normalized = normalizeApiError(e);
      setError(normalized);
      console.error('투표 상세 조회 실패:', normalized);
    } finally {
      setLoading(false);
    }
  }, [roomId, voteId]);

  useEffect(() => {
    fetchVoteDetail();
  }, [fetchVoteDetail]);

  return { data, loading, error, refetch: fetchVoteDetail };
};
