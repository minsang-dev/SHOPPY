import { useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import { getRoomMembers, getRoomByCode, joinRoomAsUser, joinRoomAsGuest } from '../../../entities/room/api/room';
import { useAuthStore } from '../../../entities/user/model/useAuthStore';
import type { RoomMember } from '../../../entities/room/types/room.types';
import { createWebRtcSession } from '../../../shared/api/webrtc';
import type { WebRTCSession } from '../../../shared/api/types';
import { useSessionStore } from '../../../entities/session/model/useSessionStore';

const realtimeEnabled = import.meta.env.VITE_REALTIME_ENABLED === 'true';

type JoinRoomPayload =
  | { roomCode: string; isLoggedIn: true }
  | { roomCode: string; nickname: string; isLoggedIn: false };

export const useJoinRoom = () => {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [session, setSession] = useState<WebRTCSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);
  const setSessionStore = useSessionStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);

  const run = async (payload: JoinRoomPayload) => {
    setLoading(true);
    setError(null);
    try {
      let roomId: number;

      // 로그인 사용자인 경우 중복 참여 체크
      if (payload.isLoggedIn && user) {
        const roomInfo = await getRoomByCode(payload.roomCode);
        const existingMembers = await getRoomMembers(String(roomInfo.roomId));
        const alreadyJoined = existingMembers.some((member) => member.userId === user.id);
        if (alreadyJoined) {
          throw new Error('이미 참여 중인 방입니다.');
        }
      }

      if (payload.isLoggedIn) {
        // 로그인 사용자: POST /rooms/join
        const joinRes = await joinRoomAsUser({ roomCode: payload.roomCode });
        roomId = joinRes.roomId;
        sessionStorage.setItem('memberId', String(joinRes.memberId));
        // 로그인 사용자 닉네임 저장 (공유 커서용)
        if (joinRes.nickname) {
          sessionStorage.setItem('memberNickname', joinRes.nickname);
        } else if (user?.nickname) {
          sessionStorage.setItem('memberNickname', user.nickname);
        }
      } else {
        // 게스트: POST /rooms/join/guest
        const joinRes = await joinRoomAsGuest({
          roomCode: payload.roomCode,
          nickname: payload.nickname
        });
        roomId = joinRes.member.roomId;
        sessionStorage.setItem('memberId', String(joinRes.member.memberId));
        // 게스트 닉네임 저장 (공유 커서용)
        sessionStorage.setItem('memberNickname', payload.nickname);
        // 게스트 토큰 저장
        if (joinRes.accessToken) {
          sessionStorage.setItem('accessToken', joinRes.accessToken);
        }
      }

      if (!roomId) {
        throw new Error('roomId not found in join response');
      }

      const memberRes = await getRoomMembers(String(roomId));
      setMembers(memberRes);

      if (realtimeEnabled) {
        const sessionRes = await createWebRtcSession(roomId);
        setSession(sessionRes);
        setSessionStore(roomId, sessionRes);
        return { roomId, members: memberRes, session: sessionRes };
      }

      return { roomId, members: memberRes, session: null };
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
