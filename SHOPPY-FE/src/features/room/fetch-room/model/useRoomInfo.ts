import { useCallback, useEffect, useState } from 'react';
import { getRoom } from '../../../../entities/room/api/room';
import type { RoomResponse } from '../../../../entities/room/types/room.types';

interface UseRoomInfoState {
  room: RoomResponse | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useRoomInfo = (roomId?: string): UseRoomInfoState => {
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!roomId) {
      return;
    }
    try {
      setLoading(true);
      const data = await getRoom(roomId);
      setRoom(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load room info:', err);
      setError('방 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { room, loading, error, reload };
};
