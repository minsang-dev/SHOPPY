import { useState, useEffect, useCallback, useRef } from 'react';
import { getVoteList, getVoteDetail, participateVote, createVote } from '@/entities/vote/api/voteApi';
import type { Vote, VoteDetail, CreateVoteRequest, VoteParticipantRequest, CreateVoteResponse } from '@/entities/vote/types/vote.types';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicVoteCreated,
  topicVoteParticipated,
  topicVoteClosed,
} from '@/shared/lib/realtime';
import { realtimeConfig } from '@/shared/config/realtime';

interface UseVoteRealtimeOptions {
  roomId?: string;
  selectedVoteId?: number | null;
}

export const useVoteRealtime = ({ roomId, selectedVoteId }: UseVoteRealtimeOptions) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voteDetail, setVoteDetail] = useState<VoteDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const realtimeClientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);

  const fetchVoteList = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getVoteList(roomId, 'OPEN');
      setVotes(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const fetchVoteDetail = useCallback(async () => {
    if (!roomId || !selectedVoteId) {
      setVoteDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      const data = await getVoteDetail(roomId, selectedVoteId);
      setVoteDetail(data);
    } catch (err) {
      console.error('투표 상세 조회 실패:', err);
    } finally {
      setDetailLoading(false);
    }
  }, [roomId, selectedVoteId]);

  const handleCreateVote = useCallback(async (payload: CreateVoteRequest) => {
    if (!roomId) return;
    await createVote(roomId, payload);
  }, [roomId]);

  const handleParticipate = useCallback(async (voteId: number, payload: VoteParticipantRequest) => {
    if (!roomId) return;
    await participateVote(roomId, voteId, payload);
  }, [roomId]);

  useEffect(() => {
    fetchVoteList();
  }, [fetchVoteList]);

  useEffect(() => {
    fetchVoteDetail();
  }, [fetchVoteDetail]);

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }

    const token =
      localStorage.getItem('accessToken') ??
      localStorage.getItem('access_token') ??
      undefined;
    if (!token) return;

    const client = createRealtimeClient({ token });
    realtimeClientRef.current = client;
    let cancelled = false;
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        const createdTopic = topicVoteCreated(roomId);
        console.log('[Vote WS] 연결 성공, 구독:', createdTopic);

        subscriptions.push(
          subscribeTopic(client, createdTopic, (body) => {
            console.log('[Vote WS] 투표 생성 이벤트 수신');
            try {
              const created = JSON.parse(body) as CreateVoteResponse;
              const newVote: Vote = {
                voteId: created.voteId,
                title: created.title,
                status: created.status,
                createdAt: created.createdAt,
                closedAt: created.closedAt ?? null,
              };
              setVotes((prev) => {
                // 중복 방지
                if (prev.some((v) => v.voteId === newVote.voteId)) {
                  return prev;
                }
                return [...prev, newVote];
              });
            } catch (err) {
              console.error('투표 생성 이벤트 파싱 실패:', err);
            }
          })
        );

        subscriptions.push(
          subscribeTopic(client, topicVoteParticipated(roomId), (body) => {
            try {
              const updated = JSON.parse(body) as VoteDetail;
              setVoteDetail((prev) => {
                if (prev?.voteId === updated.voteId) {
                  return updated;
                }
                return prev;
              });
            } catch (err) {
              console.error('투표 참여 이벤트 파싱 실패:', err);
            }
          })
        );

        subscriptions.push(
          subscribeTopic(client, topicVoteClosed(roomId), (body) => {
            console.log('[Vote WS] 투표 마감 이벤트 수신');
            try {
              const closed = JSON.parse(body) as { voteId: number; status: string; closedAt: string };
              // OPEN 목록에서 마감된 투표 제거
              setVotes((prev) => prev.filter((v) => v.voteId !== closed.voteId));
              // 현재 보고 있는 투표가 마감되면 상세 정보도 업데이트
              setVoteDetail((prev) => {
                if (prev?.voteId === closed.voteId) {
                  return { ...prev, status: 'CLOSED', closedAt: closed.closedAt };
                }
                return prev;
              });
            } catch (err) {
              console.error('투표 마감 이벤트 파싱 실패:', err);
            }
          })
        );
      })
      .catch((err) => {
        console.error('투표 WebSocket 연결 실패:', err);
      });

    return () => {
      cancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe());
      void disconnectRealtimeClient(client);
      if (realtimeClientRef.current === client) {
        realtimeClientRef.current = null;
      }
    };
  }, [roomId]);

  return {
    votes,
    voteDetail,
    loading,
    detailLoading,
    error,
    refetchVoteList: fetchVoteList,
    refetchVoteDetail: fetchVoteDetail,
    createVote: handleCreateVote,
    participate: handleParticipate,
  };
};
