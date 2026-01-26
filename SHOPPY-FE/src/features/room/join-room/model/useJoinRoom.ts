import { useCallback, useState } from 'react';
import { joinRoom } from '../../../../entities/room/api/room';
import type { JoinRoomRequest, JoinRoomResponse } from '../../../../entities/room/types/room.types';

interface UseJoinRoomState {
  loading: boolean;
  error: string | null;
  submit: (payload: JoinRoomRequest) => Promise<JoinRoomResponse | null>;
}

export const useJoinRoom = (): UseJoinRoomState => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: JoinRoomRequest) => {
    try {
      setLoading(true);
      setError(null);
      const data = await joinRoom(payload);
      return data;
    } catch (err) {
      console.error('Failed to join room:', err);
      setError('방 참가에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, submit };
};
