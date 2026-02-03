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
}

export const useSettlementRealtime = ({ roomId, onEvent }: UseSettlementRealtimeOptions) => {
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
    if (!token) {
      return;
    }

    const client = createRealtimeClient({ token });
    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        setRealtimeConnected(true);

        subscription = subscribeTopic(client, topicRoomsSettlements(roomId), (body) => {
          try {
            const parsed = JSON.parse(body) as SettlementRealtimeEvent;
            onEventRef.current?.(parsed);
          } catch {
            onEventRef.current?.({ payload: body });
          }
        });
      })
      .catch((error) => {
        console.error('Settlement realtime connection failed:', error);
        setRealtimeConnected(false);
      });

    return () => {
      cancelled = true;
      setRealtimeConnected(false);
      subscription?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [roomId]);

  return { realtimeConnected };
};
