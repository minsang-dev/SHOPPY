import { useEffect } from 'react';
import { sendPresenceHeartbeat } from '@/entities/room/api/room';
import { getOrCreateTabClientId } from '@/shared/lib/realtime';

const HEARTBEAT_INTERVAL_MS = 15_000;

export const useRoomPresenceHeartbeat = (roomId?: string) => {
  useEffect(() => {
    if (!roomId) return;

    const clientId = getOrCreateTabClientId();
    if (!clientId) return;

    let disposed = false;

    const ping = async () => {
      try {
        await sendPresenceHeartbeat(roomId, clientId);
      } catch {
        // Keep silent to avoid noisy console logs during temporary network hiccups.
      }
    };

    void ping();
    const timerId = window.setInterval(() => {
      if (disposed) return;
      void ping();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      disposed = true;
      window.clearInterval(timerId);
    };
  }, [roomId]);
};

