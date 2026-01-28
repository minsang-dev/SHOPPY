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
import './styles.css';

const MobileVideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<PanelType>('cart');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const handleExit = () => {
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

  const { isConnected, setPublishAudio, setPublishVideo } = useOpenViduSession({
    enabled: realtimeReady,
    roomId,
    accessToken,
    profile: { nickname, profileColor },
    localVideoRef,
  });

  useEffect(() => {
    setPublishAudio(micOn);
  }, [micOn, setPublishAudio]);

  useEffect(() => {
    setPublishVideo(camOn);
  }, [camOn, setPublishVideo]);

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
        />

        <MobileCameraStage videoRef={localVideoRef} hasVideo={isConnected && camOn} />

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
