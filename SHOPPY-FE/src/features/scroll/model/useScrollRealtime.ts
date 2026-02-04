import { useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import type { Client } from '@stomp/stompjs';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  publishMessage,
} from '@/shared/lib/realtime/client';
import { topicRoomsScroll, appRoomsScroll } from '@/shared/lib/realtime/topics';
import { realtimeConfig } from '@/shared/config/realtime';
import { resolveAccessToken } from '@/features/room/leave-room';

interface ScrollPositionData {
  userId: number;
  scrollX: number;
  scrollY: number;
}

interface UseScrollRealtimeProps {
  roomId: string | undefined;
  userId: number | undefined;
  isHost: boolean;
  hostMode: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const useScrollRealtime = ({
  roomId,
  userId,
  isHost,
  hostMode,
  containerRef,
}: UseScrollRealtimeProps) => {
  console.log('[SCROLL DEBUG] 훅 호출됨:', { roomId, userId, isHost, hostMode });

  const clientRef = useRef<Client | null>(null);
  const lastSentRef = useRef<number>(0);
  const hostModeRef = useRef(hostMode);
  const THROTTLE_MS = 250;

  useEffect(() => {
    hostModeRef.current = hostMode;
  }, [hostMode]);

  const publishScroll = useCallback(() => {
    if (!roomId || !userId || !isHost || !containerRef.current) return;

    const now = Date.now();
    if (now - lastSentRef.current < THROTTLE_MS) return;
    lastSentRef.current = now;

    const el = containerRef.current;
    const payload: ScrollPositionData = {
      userId,
      scrollX: el.scrollLeft,
      scrollY: el.scrollTop,
    };

    if (clientRef.current?.active) {
      console.log('[SCROLL DEBUG] 발행:', payload);
      publishMessage(clientRef.current, appRoomsScroll(roomId), payload);
    }
  }, [roomId, userId, isHost, containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!isHost || !el) return;

    el.addEventListener('scroll', publishScroll);
    return () => el.removeEventListener('scroll', publishScroll);
  }, [isHost, publishScroll, containerRef]);

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled) return;

    const token = resolveAccessToken();
    if (!token) return;

    const client = createRealtimeClient({ token });
    clientRef.current = client;
    let sub: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    console.log('[SCROLL DEBUG] WebSocket 연결 시도...', { roomId, userId, isHost });

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        console.log('[SCROLL DEBUG] WebSocket 연결 성공, 구독:', topicRoomsScroll(roomId));

        sub = subscribeTopic(client, topicRoomsScroll(roomId), (body) => {
          try {
            const data = JSON.parse(body) as ScrollPositionData;
            console.log('[SCROLL DEBUG] 수신:', data, '본인:', userId, 'hostMode:', hostModeRef.current);
            if (data.userId === userId) return;
            if (!hostModeRef.current) return;

            console.log('[SCROLL DEBUG] scrollTo 적용:', data.scrollX, data.scrollY);
            containerRef.current?.scrollTo({
              left: data.scrollX,
              top: data.scrollY,
            });
          } catch (err) {
            console.error('스크롤 데이터 파싱 실패:', err);
          }
        });
      })
      .catch((err) => console.error('[SCROLL DEBUG] WebSocket 연결 실패:', err));

    return () => {
      cancelled = true;
      sub?.unsubscribe();
      void disconnectRealtimeClient(client);
      clientRef.current = null;
    };
  }, [roomId, userId]);

  return { publishScroll };
};
