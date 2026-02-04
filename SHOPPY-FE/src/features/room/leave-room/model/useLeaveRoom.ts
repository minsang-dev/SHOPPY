import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveRoom, sendLeaveOnUnload, getRoom, joinRoomAsUser } from '@/entities/room/api/room';

export const resolveAccessToken = () =>
  window.sessionStorage.getItem('access_token') ??
  window.sessionStorage.getItem('accessToken') ??
  undefined;

const REFRESH_FLAG_KEY = 'shoppy_refreshing_room';

export interface UseLeaveRoomOptions {
  roomId: string | undefined;
  navigateTo: string;
  // Enable only where refresh-time rejoin is required.
  handleRefreshRejoin?: boolean;
}

export const useLeaveRoom = ({
  roomId,
  navigateTo,
  handleRefreshRejoin = false,
}: UseLeaveRoomOptions) => {
  const navigate = useNavigate();
  const leftRef = useRef(false);

  const leaveByButton = useCallback(() => {
    if (!roomId || leftRef.current) return;
    leftRef.current = true;
    sessionStorage.removeItem(REFRESH_FLAG_KEY);
    void leaveRoom(roomId).catch(() => {
      sendLeaveOnUnload(roomId, resolveAccessToken());
    });
    navigate(navigateTo);
  }, [roomId, navigateTo, navigate]);

  useEffect(() => {
    if (!handleRefreshRejoin || !roomId) return;

    const handleBeforeUnload = () => {
      if (leftRef.current) return;
      sessionStorage.setItem(REFRESH_FLAG_KEY, roomId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, handleRefreshRejoin]);

  useEffect(() => {
    if (!handleRefreshRejoin || !roomId) return;

    const savedRoomId = sessionStorage.getItem(REFRESH_FLAG_KEY);
    if (savedRoomId === roomId) {
      sessionStorage.removeItem(REFRESH_FLAG_KEY);
      void (async () => {
        try {
          const roomInfo = await getRoom(roomId);
          if (roomInfo.inviteCode) {
            await joinRoomAsUser({ roomCode: roomInfo.inviteCode });
          }
        } catch (err) {
          console.error('Refresh rejoin failed:', err);
        }
      })();
    }
  }, [roomId, handleRefreshRejoin]);

  return { leaveByButton };
};