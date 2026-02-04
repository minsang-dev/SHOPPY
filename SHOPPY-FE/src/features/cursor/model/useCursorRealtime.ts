import { useEffect, useRef, useState, useCallback } from 'react';
import type { Client } from '@stomp/stompjs';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  publishMessage,
} from '@/shared/lib/realtime/client';
import { topicRoomsCursor, appRoomsCursor } from '@/shared/lib/realtime/topics';
import { realtimeConfig } from '@/shared/config/realtime';
import { resolveAccessToken } from '@/features/room/leave-room';

export interface CursorData {
  userId: number;
  nickname: string;
  colorKey: string;
  x: number;
  y: number;
}

interface UseCursorRealtimeProps {
  roomId: string | undefined;
  userId: number | undefined;
  nickname: string;
  colorKey: string;
  enabled: boolean; // 호스트일 때만 true (커서 발행 여부)
}

export const useCursorRealtime = ({
  roomId,
  userId,
  nickname,
  colorKey,
  enabled,
}: UseCursorRealtimeProps) => {
  const [cursors, setCursors] = useState<Map<number, CursorData>>(new Map());
  const clientRef = useRef<Client | null>(null);
  const lastSentRef = useRef<number>(0);
  const THROTTLE_MS = 66; // 15 FPS

  // 커서 발행 (x, y는 0~1 비율)
  const publishCursor = useCallback(
    (x: number, y: number) => {
      if (!roomId || !userId || !enabled) return;

      const now = Date.now();
      if (now - lastSentRef.current < THROTTLE_MS) return;
      lastSentRef.current = now;

      const payload: CursorData = {
        userId,
        nickname,
        colorKey,
        x,
        y,
      };

      if (clientRef.current?.active) {
        publishMessage(clientRef.current, appRoomsCursor(roomId), payload);
      }
    },
    [roomId, userId, nickname, colorKey, enabled]
  );

  // 웹소켓 연결 및 구독
  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }

    const token = resolveAccessToken();
    if (!token) return;

    const client = createRealtimeClient({ token });
    clientRef.current = client;

    let cursorSub: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        cursorSub = subscribeTopic(client, topicRoomsCursor(roomId), (body) => {
          try {
            const data = JSON.parse(body) as CursorData;
            if (data.userId === userId) return;

            setCursors((prev) => {
              const next = new Map(prev);
              next.set(data.userId, data);
              return next;
            });
          } catch (err) {
            console.error('커서 데이터 파싱 실패:', err);
          }
        });
      })
      .catch((err) => {
        console.error('커서 웹소켓 연결 실패:', err);
      });

    return () => {
      cancelled = true;
      cursorSub?.unsubscribe();
      void disconnectRealtimeClient(client);
      clientRef.current = null;
    };
  }, [roomId, userId]);

  return {
    cursors,
    publishCursor,
  };
};
