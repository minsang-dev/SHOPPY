import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import type { VideoChatMode, RightPanelType } from '../../../entities/room/types/desktopVideoChat.types';
import VideoChatHeader from '../../../widgets/desktop/VideoChatHeader/VideoChatHeader';
import RightPanel from '../../../widgets/desktop/RightPanel/RightPanel';
import { leaveRoom } from '../../../entities/room/api/room';
import './styles.css';

const resolveAccessToken = () =>
  window.localStorage.getItem('access_token') ??
  window.localStorage.getItem('accessToken') ??
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
  const { roomId } = useParams<{ roomId?: string }>();
  const [mode, setMode] = useState<VideoChatMode>('personal');
  const [activePanel, setActivePanel] = useState<RightPanelType>('cart');
  const leftRef = useRef(false);

  const handleExit = () => {
    if (roomId && !leftRef.current) {
      leftRef.current = true;
      void leaveRoom(roomId).catch(() => {
        sendKeepAliveLeave(roomId, resolveAccessToken());
      });
    }
    navigate('/');
  };

  const handleModeChange = (newMode: VideoChatMode) => {
    setMode(newMode);
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

  return (
    <div className="video-chat-page">
      <VideoChatHeader
        mode={mode}
        onModeChange={handleModeChange}
        onExit={handleExit}
        activePanel={activePanel}
        onPanelToggle={handlePanelToggle}
      />
      <div className="video-chat-content">
        <div className="video-chat-left">
          {/* 중첩 라우터 -> Outlet으로 router에서 정의한 화면 랜더링 */}
          <Outlet />
        </div>
        <div className="video-chat-right">
          <RightPanel panelType={activePanel} />
        </div>
      </div>
    </div>
  );
};

export default DesktopVideoChatPage;
