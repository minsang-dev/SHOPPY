import { useEffect, useRef, useState } from 'react';
import { realtimeConfig } from '@/shared/config/realtime';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicRoomsSettlements,
} from '@/shared/lib/realtime';

const resolveToken = () =>
  sessionStorage.getItem('accessToken') ??
  sessionStorage.getItem('access_token') ??
  undefined;

export interface SettlementRealtimeEvent {
  type?: string;
  roomId?: number | string;
  payload?: unknown;
  [key: string]: unknown;
}

interface UseSettlementRealtimeOptions {
  roomId?: string;
  onEvent?: (event: SettlementRealtimeEvent) => void;
  pollIntervalMs?: number;
}

export const useSettlementRealtime = ({
  roomId,
  onEvent,
  pollIntervalMs = 2500,
}: UseSettlementRealtimeOptions) => {
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }

    const token = resolveToken();
    const client = createRealtimeClient({ token });
    let subscriptions: Array<{ unsubscribe: () => void }> = [];
    let cancelled = false;
    const topicCandidates = [
      topicRoomsSettlements(roomId),
      `/topic/rooms/${roomId}/settlement`,
      `/topic/rooms/${roomId}/settlements/updated`,
      `/topic/rooms/${roomId}/settlement/updated`,
    ];

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        setRealtimeConnected(true);
        subscriptions = topicCandidates.map((topic) =>
          subscribeTopic(client, topic, (body) => {
            try {
              const parsed = JSON.parse(body) as SettlementRealtimeEvent;
              onEventRef.current?.(parsed);
            } catch {
              onEventRef.current?.({ payload: body });
            }
          }),
        );
      })
      .catch((error) => {
        console.error('Settlement realtime connection failed:', error);
        setRealtimeConnected(false);
      });

    const pollTimer = window.setInterval(() => {
      onEventRef.current?.({
        type: 'SETTLEMENT_POLL',
        roomId,
      });
    }, pollIntervalMs);

    return () => {
      cancelled = true;
      setRealtimeConnected(false);
      window.clearInterval(pollTimer);
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      subscriptions = [];
      void disconnectRealtimeClient(client);
    };
  }, [pollIntervalMs, roomId]);

  return { realtimeConnected };
};
