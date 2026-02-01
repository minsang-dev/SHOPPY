import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileBottomNav from '../../../widgets/mobile/Mobile/MobileBottomNav';
import MobileCameraStage from '../../../widgets/mobile/Mobile/MobileCameraStage';
import MobilePanelHost from '../../../widgets/mobile/Mobile/MobilePanelHost';
import type { PanelType } from '../../../widgets/mobile/Mobile/MobilePanelHost';
import MobileTopBar from '../../../widgets/mobile/Mobile/MobileTopBar';
import { realtimeConfig } from '../../../shared/config/realtime';
import { useOpenViduSession } from '../../../features/video-chat/model/useOpenViduSession';
import { useRoomInfo } from '../../../features/room/fetch-room/model/useRoomInfo';
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

const MobileVideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<PanelType>('cart');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const leftRef = useRef(false);

  const handleExit = () => {
    if (roomId && !leftRef.current) {
      leftRef.current = true;
      void leaveRoom(roomId).catch(() => {
        sendKeepAliveLeave(roomId, resolveAccessToken());
      });
    }
    navigate('/m');
  };

  const handleEndShopping = () => {
    navigate('/m/settlement');
  };

  const handleToggleMic = () => {
    setMicOn((prev) => !prev);
  };

  const handleToggleCam = () => {
    setCamOn((prev) => !prev);
  };

  const handleSwitchCamera = () => {
    setCameraFacingMode((prev) => {
      const next = prev === 'environment' ? 'user' : 'environment';
      void switchCamera(next);
      return next;
    });
  };

  const realtimeReady =
    realtimeConfig.enabled &&
    Boolean(realtimeConfig.websocketUrl) &&
    Boolean(realtimeConfig.signalingUrl);

  const params = useParams<{ roomId?: string }>();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const roomId =
    searchParams.get('room_id') ??
    params.roomId ??
    (import.meta.env.VITE_USE_MOCK === 'true' ? '1' : undefined);
  const accessToken =
    searchParams.get('access_token') ??
    window.localStorage.getItem('access_token') ??
    window.localStorage.getItem('accessToken') ??
    undefined;
  const nickname = searchParams.get('nickname') ?? undefined;
  const profileColor = searchParams.get('profile_color') ?? undefined;

  const { room } = useRoomInfo(roomId);

  const { isConnected, setPublishAudio, setPublishVideo, switchCamera } = useOpenViduSession({
    enabled: realtimeReady,
    roomId,
    accessToken,
    profile: { nickname, profileColor },
    localVideoRef,
    videoFacingMode: cameraFacingMode,
  });

  useEffect(() => {
    const root = document.documentElement;
    const visualViewport = window.visualViewport;
    let baselineHeight = window.innerHeight;
    root.style.setProperty('--app-height', `${baselineHeight}px`);

    if (!visualViewport) {
      return () => {
        root.style.removeProperty('--keyboard-offset');
        root.style.removeProperty('--app-height');
      };
    }

    const updateKeyboardOffset = () => {
      const offset = Math.max(0, baselineHeight - visualViewport.height - visualViewport.offsetTop);
      root.style.setProperty('--keyboard-offset', `${offset}px`);
    };

    updateKeyboardOffset();
    visualViewport.addEventListener('resize', updateKeyboardOffset);
    visualViewport.addEventListener('scroll', updateKeyboardOffset);
    const handleOrientationChange = () => {
      baselineHeight = window.innerHeight;
      root.style.setProperty('--app-height', `${baselineHeight}px`);
      updateKeyboardOffset();
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      visualViewport.removeEventListener('resize', updateKeyboardOffset);
      visualViewport.removeEventListener('scroll', updateKeyboardOffset);
      window.removeEventListener('orientationchange', handleOrientationChange);
      root.style.removeProperty('--keyboard-offset');
      root.style.removeProperty('--app-height');
    };
  }, []);

  useEffect(() => {
    setPublishAudio(micOn);
  }, [micOn, setPublishAudio]);

  useEffect(() => {
    setPublishVideo(camOn);
  }, [camOn, setPublishVideo]);

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
    <div className="mobile-room-page" data-realtime-ready={realtimeReady ? 'true' : 'false'}>
      <div className="mobile-room-shell">
        <MobileTopBar
          onExit={handleExit}
          title={room?.roomName ?? 'shoppy'}
          backLabel="Go back"
          micOnLabel="Mute microphone"
          micOffLabel="Unmute microphone"
          camOnLabel="Turn off camera"
          camOffLabel="Turn on camera"
          micOn={micOn}
          camOn={camOn}
          onToggleMic={handleToggleMic}
          onToggleCam={handleToggleCam}
          onSwitchCamera={handleSwitchCamera}
          cameraFacingMode={cameraFacingMode}
          cameraSwitchLabel="카메라 전환"
          showControls={false}
        />

        <MobileCameraStage
          videoRef={localVideoRef}
          hasVideo={isConnected && camOn}
          mirror={cameraFacingMode === 'user'}
        />
        <div className="mobile-camera-controls">
          <button
            type="button"
            className={`mobile-topbar-icon ${micOn ? '' : 'is-off'}`}
            onClick={handleToggleMic}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            <i className={micOn ? 'ri-mic-fill' : 'ri-mic-off-fill'} />
          </button>
          <button
            type="button"
            className={`mobile-topbar-icon ${camOn ? '' : 'is-off'}`}
            onClick={handleToggleCam}
            aria-label={camOn ? 'Turn off camera' : 'Turn on camera'}
          >
            <i className={camOn ? 'ri-camera-fill' : 'ri-camera-off-line'} />
          </button>
          <button
            type="button"
            className="mobile-topbar-icon"
            onClick={handleSwitchCamera}
            aria-label="카메라 전환"
            title="카메라 전환"
            disabled={!camOn}
            data-facing={cameraFacingMode}
          >
            <i className="ri-camera-switch-line" />
          </button>
        </div>

        <div className="mobile-room-panel">
          <MobilePanelHost
            activePanel={activePanel}
            roomId={roomId}
            onEndShopping={handleEndShopping}
          />
        </div>

        <MobileBottomNav active={activePanel} onChange={setActivePanel} />
      </div>
    </div>
  );
};

export default MobileVideoChatPage;
