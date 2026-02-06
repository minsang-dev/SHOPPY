import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import MobileBottomNav from '../../../widgets/mobile/Mobile/MobileBottomNav';
import MobileCameraStage from '../../../widgets/mobile/Mobile/MobileCameraStage';
import type { PanelType } from '../../../widgets/mobile/Mobile/MobilePanelHost';
import MobileTopBar from '../../../widgets/mobile/Mobile/MobileTopBar';
import { realtimeConfig } from '../../../shared/config/realtime';
import { useOpenViduSession } from '../../../features/video-chat/model/useOpenViduSession';
import { useRoomInfo } from '../../../features/room/fetch-room/model/useRoomInfo';
import { useLeaveRoom } from '@/features/room/leave-room';
import { RoomMembersProvider } from '../../../features/room/fetch-members/model/RoomMembersProvider';
import './styles.css';

const MobileVideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState<PanelType>('cart');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const localVideoRef = useRef<HTMLVideoElement>(null);

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
    Boolean(realtimeConfig.websocketUrl);

  const params = useParams<{ roomId?: string }>();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const roomId =
    searchParams.get('room_id') ??
    params.roomId ??
    (import.meta.env.VITE_USE_MOCK === 'true' ? '1' : undefined);
  const accessToken =
    searchParams.get('access_token') ??
    window.sessionStorage.getItem('access_token') ??
    window.sessionStorage.getItem('accessToken') ??
    undefined;
  const nickname = searchParams.get('nickname') ?? undefined;
  const profileColor = searchParams.get('profile_color') ?? undefined;

  const { room } = useRoomInfo(roomId);
  const { leaveByButton } = useLeaveRoom({
    roomId,
    navigateTo: '/m',
    handleRefreshRejoin: true,
  });

  const handleEndShopping = () => {
    if (!roomId) {
      navigate('/m');
      return;
    }

    // ?? ?? ? ???? ?? ?? ???? ??
    setCamOn(false);
    navigate(`/m/room/${encodeURIComponent(roomId)}/settlement`);
  };

  const handleChangePanel = (panel: PanelType) => {
    setActivePanel(panel);
    if (!roomId) return;
    if (location.pathname !== `/m/room/${roomId}`) {
      navigate(`/m/room/${encodeURIComponent(roomId)}`);
    }
  };
  const isSettlementRoute = location.pathname.includes('/settlement');

  const handleTopBarBack = () => {
    if (isSettlementRoute) {
      setCamOn(true);
      if (roomId) {
        navigate(`/m/room/${encodeURIComponent(roomId)}`);
      } else {
        navigate('/m/room');
      }
      return;
    }

    leaveByButton();
  };

  const [prevIsSettlementRoute, setPrevIsSettlementRoute] = useState(isSettlementRoute);
  if (prevIsSettlementRoute !== isSettlementRoute) {
    setPrevIsSettlementRoute(isSettlementRoute);
    if (prevIsSettlementRoute && !isSettlementRoute) {
      setCamOn(true);
    }
  }

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
    const updateViewportVars = () => {
      const height = visualViewport?.height ?? window.innerHeight;
      root.style.setProperty('--app-height', `${height}px`);
      if (!visualViewport) {
        root.style.setProperty('--keyboard-offset', `0px`);
        return;
      }
      const offset = Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop);
      root.style.setProperty('--keyboard-offset', `${offset}px`);
    };

    if (!visualViewport) {
      updateViewportVars();
      return () => {
        root.style.removeProperty('--keyboard-offset');
        root.style.removeProperty('--app-height');
      };
    }

    updateViewportVars();
    visualViewport.addEventListener('resize', updateViewportVars);
    visualViewport.addEventListener('scroll', updateViewportVars);
    const handleOrientationChange = () => {
      updateViewportVars();
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      visualViewport.removeEventListener('resize', updateViewportVars);
      visualViewport.removeEventListener('scroll', updateViewportVars);
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
    if (!roomId) return;
    sessionStorage.setItem('roomId', roomId);
  }, [roomId]);

  return (
    <RoomMembersProvider roomId={roomId}>
      <div className="mobile-room-page" data-realtime-ready={realtimeReady ? 'true' : 'false'}>
        <div className={`mobile-room-shell ${isSettlementRoute ? 'is-settlement' : ''}`}>
          <MobileTopBar
            onExit={handleTopBarBack}
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
          <div className={`mobile-camera-section ${isSettlementRoute ? 'is-hidden' : ''}`}>
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
                aria-label="??? ??"
                title="??? ??"
                disabled={!camOn}
                data-facing={cameraFacingMode}
              >
                <i className="ri-camera-switch-line" />
              </button>
            </div>
          </div>

          <div className="mobile-room-panel">
            <Outlet context={{ roomId, activePanel, onEndShopping: handleEndShopping }} />
          </div>

          {!isSettlementRoute && <MobileBottomNav active={activePanel} onChange={handleChangePanel} />}
        </div>
      </div>
    </RoomMembersProvider>
  );
};

export default MobileVideoChatPage;
