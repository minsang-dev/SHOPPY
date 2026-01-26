import { useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import { createRoom, type CreateRoomRequest } from '../../../shared/api/rooms';
import type { Room } from '../../../shared/api/types';

export const useCreateRoom = () => {
  const [data, setData] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const run = async (payload: CreateRoomRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createRoom(payload);
      setData(res);
      return res;
    } catch (e) {
      const normalized = normalizeApiError(e);
      setError(normalized);
      throw normalized;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, run };
};
