import { useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import { getRoomMembers, joinRoomAsUser, joinRoomAsGuest } from '../../../entities/room/api/room';
import type { RoomMember } from '../../../entities/room/types/room.types';
import { createWebRtcSession } from '../../../shared/api/webrtc';
import type { WebRTCSession } from '../../../shared/api/types';
import { useSessionStore } from '../../../entities/session/model/useSessionStore';

type JoinRoomPayload =
  | { roomCode: string; isLoggedIn: true }
  | { roomCode: string; nickname: string; isLoggedIn: false };

export const useJoinRoom = () => {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [session, setSession] = useState<WebRTCSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);
  const setSessionStore = useSessionStore((state) => state.setSession);

  const run = async (payload: JoinRoomPayload) => {
    setLoading(true);
    setError(null);
    try {
      let roomId: number;

      if (payload.isLoggedIn) {
        // 로그인 사용자: POST /rooms/join
        const joinRes = await joinRoomAsUser({ roomCode: payload.roomCode });
        roomId = joinRes.roomId;
      } else {
        // 게스트: POST /rooms/join/guest
        const joinRes = await joinRoomAsGuest({ 
          roomCode: payload.roomCode, 
          nickname: payload.nickname 
        });
        roomId = joinRes.member.roomId;
        // 게스트 토큰 저장
        if (joinRes.accessToken) {
          localStorage.setItem('accessToken', joinRes.accessToken);
        }
      }

      if (!roomId) {
        throw new Error('roomId not found in join response');
      }

      const memberRes = await getRoomMembers(String(roomId));
      setMembers(memberRes);

      const sessionRes = await createWebRtcSession(roomId);
      setSession(sessionRes);
      setSessionStore(roomId, sessionRes);

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
