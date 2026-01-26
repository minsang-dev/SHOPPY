import { useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import { getRoomMembers, joinRoom } from '../../../shared/api/rooms';
import { createWebRtcSession } from '../../../shared/api/webrtc';
import type { Member, WebRTCSession } from '../../../shared/api/types';

export const useJoinRoom = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<WebRTCSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const run = async (payload: { roomCode: string; nickname: string }) => {
    setLoading(true);
    setError(null);
    try {
      const joinRes = await joinRoom(payload);
      const roomId = joinRes.roomId;
      if (!roomId) {
        throw new Error('roomId not found in join response');
      }

      const memberRes = await getRoomMembers(roomId);
      setMembers(memberRes);

      const sessionRes = await createWebRtcSession(roomId);
      setSession(sessionRes);

      return { roomId, members: memberRes, session: sessionRes };
    } catch (e) {
      const normalized = normalizeApiError(e);
      setError(normalized);
      throw normalized;
    } finally {
      setLoading(false);
    }
  };

  return { members, session, loading, error, run };
};
