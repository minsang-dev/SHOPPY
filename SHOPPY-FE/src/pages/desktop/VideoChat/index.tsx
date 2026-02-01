import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Outlet, useParams, useLocation } from 'react-router-dom';
import type { VideoChatMode, RightPanelType } from '../../../entities/room/types/desktopVideoChat.types';
import VideoChatHeader from '../../../widgets/desktop/VideoChatHeader/VideoChatHeader';
import RightPanel from '../../../widgets/desktop/RightPanel/RightPanel';
import { ChatRealtimeProvider } from '../../../features/chat/model/useChatRealtime';
import VideoStage from '../../../widgets/desktop/VideoStage/VideoStage';
import { leaveRoom, patchSyncMode, patchHostUrl, getRoom } from '../../../entities/room/api/room';
import { useRoomInfo } from '../../../features/room/fetch-room/model/useRoomInfo';
import { useAuthStore } from '../../../entities/user/model/useAuthStore';
import { realtimeConfig } from '../../../shared/config/realtime';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicRoomsHostUrl,
} from '../../../shared/lib/realtime';
import './styles.css';

const resolveAccessToken = () =>
  window.sessionStorage.getItem('access_token') ??
  window.sessionStorage.getItem('accessToken') ??
  undefined;

const sendKeepAliveLeave = (roomId: string, token?: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const url = `${baseUrl}/rooms/${roomId}/leave`;
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    void fetch(url, { method: 'DELETE', headers, keepalive: true });
  } catch {
    // best-effort on unload
  }
};

const DesktopVideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId?: string }>();
  const [mode, setMode] = useState<VideoChatMode>('personal');
  const [activePanel, setActivePanel] = useState<RightPanelType>('cart');
  const leftRef = useRef(false);

  // 방 정보 및 사용자 정보
  const { room } = useRoomInfo(roomId);
  const user = useAuthStore((state) => state.user);

  // 호스트 여부 판단
  const isHost = room && user ? room.hostId === user.id : false;

  const handleExit = () => {
    if (roomId && !leftRef.current) {
      leftRef.current = true;
      void leaveRoom(roomId).catch(() => {
        sendKeepAliveLeave(roomId, resolveAccessToken());
      });
    }
    navigate('/');
  };

  const handleModeChange = async (newMode: VideoChatMode) => {
    // 각 사용자가 자신의 syncMode를 변경 (FOLLOW: 호스트 따라가기, FREE: 자유 탐색)
    const syncMode = newMode === 'personal' ? 'FREE' : 'FOLLOW';
    console.log('handleModeChange called:', { newMode, syncMode, roomId });

    if (!roomId) {
      setMode(newMode);
      return;
    }

    try {
      await patchSyncMode(roomId, { syncMode });
      console.log('patchSyncMode success');
      setMode(newMode);

      // FOLLOW 모드로 전환 시, 최신 방 정보 조회 후 호스트 URL로 이동
      if (newMode === 'host' && !isHost) {
        const latestRoom = await getRoom(roomId);
        if (latestRoom.hostCurrentUrl) {
          console.log('Navigating to host URL:', latestRoom.hostCurrentUrl);
          navigate(latestRoom.hostCurrentUrl);
        }
      }
    } catch (err) {
      console.error('Mode change error:', err);
    }
  };

  const handlePanelToggle = (panel: RightPanelType) => {
    setActivePanel(panel);
  };

  useEffect(() => {
    if (!roomId) {
      return;
    }
    const token = resolveAccessToken();
    const handleLeave = () => {
      if (leftRef.current) {
        return;
      }
      leftRef.current = true;
      sendKeepAliveLeave(roomId, token);
    };

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);
    return () => {
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [roomId]);

  // WebSocket 구독: host-url 변경 수신
  // mode를 ref로 추적하여 최신 값 참조
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token = resolveAccessToken();
    if (!token) {
      return;
    }

    const client = createRealtimeClient({ token });
    let hostUrlSub: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;

        // host-url 변경 구독 (FOLLOW 모드인 참여자만 따라감)
        hostUrlSub = subscribeTopic(client, topicRoomsHostUrl(roomId), (body) => {
          try {
            // 백엔드 이벤트 형식: { type: "HOST_URL_UPDATED", roomId: number, payload: string }
            const event = JSON.parse(body) as { type: string; roomId: number; payload: string };
            const hostUrl = event.payload;
            // FOLLOW 모드(mode === 'host')이고 호스트가 아닌 경우에만 따라감
            if (hostUrl && modeRef.current === 'host' && !isHost) {
              console.log('Received host URL, navigating to:', hostUrl);
              navigate(hostUrl);
            }
          } catch (err) {
            console.error('Failed to parse host-url event:', err);
          }
        });
      })
      .catch((err) => {
        console.error('Realtime connection failed:', err);
      });

    return () => {
      cancelled = true;
      hostUrlSub?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [roomId, isHost, navigate]);

  // 호스트일 때 페이지 이동 시 자동으로 host-url 전송 (모드 상관없이)
  useEffect(() => {
    if (!roomId || !isHost) {
      return;
    }
    const currentUrl = location.pathname;
    console.log('Host navigated, sending URL:', currentUrl);
    void patchHostUrl(roomId, { currentUrl }).catch((err) => {
      console.error('Failed to update host URL:', err);
    });
  }, [roomId, isHost, location.pathname]);

  return (
    <div className="video-chat-page">
      <ChatRealtimeProvider activePanel={activePanel}>
        <VideoChatHeader
          mode={mode}
          onModeChange={handleModeChange}
          onExit={handleExit}
          activePanel={activePanel}
          onPanelToggle={handlePanelToggle}
        />
        <div className="video-chat-content">
          <div
            className="video-chat-left"
            style={{
              pointerEvents: mode === 'host' && !isHost ? 'none' : 'auto',
              position: 'relative',
            }}
          >
            {/* 중첩 라우터 -> Outlet으로 router에서 정의한 화면 랜더링 */}
            <div className="video-chat-body">
              <Outlet />
            </div>
            {/* 호스트 모드일 때 참여자에게 안내 오버레이 */}
            {mode === 'host' && !isHost && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  zIndex: 10,
                }}
              >
                호스트 모드: 호스트가 화면을 제어 중입니다
              </div>
            )}
            <VideoStage roomId={roomId} />
          </div>
          <div className="video-chat-right">
            <RightPanel panelType={activePanel} />
          </div>
        </div>
      </ChatRealtimeProvider>
    </div>
  );
};

export default DesktopVideoChatPage;
