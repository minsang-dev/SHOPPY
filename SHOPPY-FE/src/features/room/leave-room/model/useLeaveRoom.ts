import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveRoom, sendLeaveOnUnload, getRoom, joinRoomAsUser } from '@/entities/room/api/room';

export const resolveAccessToken = () =>
  window.sessionStorage.getItem('access_token') ??
  window.sessionStorage.getItem('accessToken') ??
  undefined;

const REFRESH_FLAG_KEY = 'shoppy_refreshing_room';

export interface UseLeaveRoomOptions {
  /** 방 ID (없으면 leave 미등록) */
  roomId: string | undefined;
  /** 나가기 버튼 클릭 후 이동할 경로 */
  navigateTo: string;
}

/**
 * 방 나가기: 버튼 클릭 시에만 leave 처리.
 * 새로고침 시에는 서버 WebSocket disconnect로 나감 처리되므로 자동 재입장.
 * FSD feature: leave-room
 */
export const useLeaveRoom = ({ roomId, navigateTo }: UseLeaveRoomOptions) => {
  const navigate = useNavigate();
  const leftRef = useRef(false);

  const leaveByButton = useCallback(() => {
    if (!roomId || leftRef.current) return;
    leftRef.current = true;
    // 버튼으로 나갈 때는 플래그 제거 (재입장 방지)
    sessionStorage.removeItem(REFRESH_FLAG_KEY);
    void leaveRoom(roomId).catch(() => {
      sendLeaveOnUnload(roomId, resolveAccessToken());
    });
    navigate(navigateTo);
  }, [roomId, navigateTo, navigate]);

  // 새로고침 감지용 플래그 설정
  useEffect(() => {
    if (!roomId) return;

    const handleBeforeUnload = () => {
      if (leftRef.current) return;
      sessionStorage.setItem(REFRESH_FLAG_KEY, roomId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId]);

  // 새로고침 후 재입장 처리
  useEffect(() => {
    if (!roomId) return;

    const savedRoomId = sessionStorage.getItem(REFRESH_FLAG_KEY);
    if (savedRoomId === roomId) {
      sessionStorage.removeItem(REFRESH_FLAG_KEY);
      // 서버 WebSocket disconnect 처리 후 재입장
      void (async () => {
        try {
          const roomInfo = await getRoom(roomId);
          if (roomInfo.inviteCode) {
            await joinRoomAsUser({ roomCode: roomInfo.inviteCode });
          }
        } catch (err) {
          console.error('새로고침 후 재입장 실패:', err);
        }
      })();
    }
  }, [roomId]);

  return { leaveByButton };
};
