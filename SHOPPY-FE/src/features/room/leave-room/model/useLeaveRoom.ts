import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveRoom, sendLeaveOnUnload } from '@/entities/room/api/room';

export const resolveAccessToken = () =>
  window.sessionStorage.getItem('access_token') ??
  window.sessionStorage.getItem('accessToken') ??
  undefined;

export interface UseLeaveRoomOptions {
  /** 방 ID (없으면 leave 미등록) */
  roomId: string | undefined;
  /** 나가기 버튼 클릭 후 이동할 경로 */
  navigateTo: string;
}

/**
 * 방 나가기: 버튼 클릭 + unload(탭 닫기/새로고침) 시 leave 처리.
 * FSD feature: leave-room
 */
export const useLeaveRoom = ({ roomId, navigateTo }: UseLeaveRoomOptions) => {
  const navigate = useNavigate();
  const leftRef = useRef(false);

  const leaveByButton = useCallback(() => {
    if (!roomId || leftRef.current) return;
    leftRef.current = true;
    void leaveRoom(roomId).catch(() => {
      sendLeaveOnUnload(roomId, resolveAccessToken());
    });
    navigate(navigateTo);
  }, [roomId, navigateTo, navigate]);

  useEffect(() => {
    if (!roomId) return;
    const token = resolveAccessToken();

    // beforeunload: 탭 닫기, 새로고침, URL 이동 시
    const handleBeforeUnload = () => {
      if (leftRef.current) return;
      leftRef.current = true;
      sendLeaveOnUnload(roomId, token);
    };

    // pagehide: persisted=false일 때만 진짜 나감 (bfcache 제외)
    const handlePageHide = (e: PageTransitionEvent) => {
      if (leftRef.current) return;
      // persisted=true면 bfcache로 저장됨 (복원 가능) -> leave 처리 안 함
      if (e.persisted) return;
      leftRef.current = true;
      sendLeaveOnUnload(roomId, token);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [roomId]);

  return { leaveByButton };
};
