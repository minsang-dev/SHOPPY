import { useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import { createRoom, getRoomMembers } from '../../../entities/room/api/room';
import type { CreateRoomRequest, CreateRoomResponse, RoomMember } from '../../../entities/room/types/room.types';
import { createWebRtcSession } from '../../../shared/api/webrtc';
import type { WebRTCSession } from '../../../shared/api/types';
import { useSessionStore } from '../../../entities/session/model/useSessionStore';

const realtimeEnabled = import.meta.env.VITE_REALTIME_ENABLED === 'true';

export const useCreateRoom = () => {
  const [data, setData] = useState<CreateRoomResponse | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [session, setSession] = useState<WebRTCSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);
  const setSessionStore = useSessionStore((state) => state.setSession);

  const run = async (payload: CreateRoomRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createRoom(payload);
      console.log('방 생성 응답:', res);
      console.log('inviteCode:', res.inviteCode);
      setData(res);

      const roomId = res.roomId;
      const memberRes = await getRoomMembers(String(roomId));
      setMembers(memberRes);

      if (realtimeEnabled) {
        const sessionRes = await createWebRtcSession(roomId);
        setSession(sessionRes);
        setSessionStore(roomId, sessionRes);
        return { room: res, roomId, members: memberRes, session: sessionRes };
      }

      return { room: res, roomId, members: memberRes, session: null };
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
