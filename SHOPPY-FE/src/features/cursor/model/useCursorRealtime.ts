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
      // [DEBUG] 발행 조건 체크
      if (!roomId || !userId || !enabled) {
        console.log('[CURSOR DEBUG] publishCursor 스킵:', { roomId, userId, enabled });
        return;
      }

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

      // 본인 커서는 Map에 추가하지 않음 (OS 기본 커서 사용)
      // 웹소켓으로 발행
      if (clientRef.current?.active) {
        console.log('[CURSOR DEBUG] 커서 발행:', payload);
        publishMessage(clientRef.current, appRoomsCursor(roomId), payload);
      } else {
        console.log('[CURSOR DEBUG] WebSocket 비활성 상태');
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

    console.log('[CURSOR DEBUG] WebSocket 연결 시도...', { roomId, userId });

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        console.log('[CURSOR DEBUG] WebSocket 연결 성공, 구독 시작:', topicRoomsCursor(roomId));

        cursorSub = subscribeTopic(client, topicRoomsCursor(roomId), (body) => {
          try {
            const data = JSON.parse(body) as CursorData;
            console.log('[CURSOR DEBUG] 커서 수신:', data, '본인 userId:', userId);

            // 본인 커서는 무시
            if (data.userId === userId) {
              console.log('[CURSOR DEBUG] 본인 커서 무시');
              return;
            }

            setCursors((prev) => {
              const next = new Map(prev);
              next.set(data.userId, data);
              console.log('[CURSOR DEBUG] cursors Map 업데이트:', Array.from(next.entries()));
              return next;
            });
          } catch (err) {
            console.error('커서 데이터 파싱 실패:', err);
          }
        });
      })
      .catch((err) => {
        console.error('[CURSOR DEBUG] 커서 웹소켓 연결 실패:', err);
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
