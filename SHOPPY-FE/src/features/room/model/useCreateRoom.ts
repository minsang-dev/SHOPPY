import { useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import { createRoom, getRoomMembers, type CreateRoomRequest } from '../../../shared/api/rooms';
import { createWebRtcSession } from '../../../shared/api/webrtc';
import type { Member, Room, WebRTCSession } from '../../../shared/api/types';
import { useSessionStore } from '../../../entities/session/model/useSessionStore';

export const useCreateRoom = () => {
  const [data, setData] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<WebRTCSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);
  const setSessionStore = useSessionStore((state) => state.setSession);

  const run = async (payload: CreateRoomRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createRoom(payload);
      setData(res);

      const roomId = res.roomId;
      const memberRes = await getRoomMembers(roomId);
      setMembers(memberRes);

      const sessionRes = await createWebRtcSession(roomId);
      setSession(sessionRes);
      setSessionStore(roomId, sessionRes);

      return { room: res, roomId, members: memberRes, session: sessionRes };
    } catch (e) {
      const normalized = normalizeApiError(e);
      setError(normalized);
      throw normalized;
    } finally {
      setLoading(false);
    }
  };

  return { data, members, session, loading, error, run };
};
