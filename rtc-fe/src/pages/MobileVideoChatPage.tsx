import React, { useState } from 'react';
import MobileBottomNav from '../components/Mobile/MobileBottomNav';
import MobileCameraStage from '../components/Mobile/MobileCameraStage';
import MobilePanelHost from '../components/Mobile/MobilePanelHost';
import type { PanelType } from '../components/Mobile/MobilePanelHost';
import MobileTopBar from '../components/Mobile/MobileTopBar';
import { realtimeConfig } from '../constants/realtime';
import './MobileVideoChatPage.css';

const MobileVideoChatPage: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>('cart');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const handleExit = () => {
    console.log('exit room');
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

  return (
    <div className="mobile-room-page" data-realtime-ready={realtimeReady ? 'true' : 'false'}>
      <div className="mobile-room-shell">
        <MobileTopBar
          onExit={handleExit}
          title="Weekend shopping"
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

        <MobileCameraStage />

        <MobilePanelHost activePanel={activePanel} />

        <MobileBottomNav active={activePanel} onChange={setActivePanel} />
      </div>
    </div>
  );
};

export default MobileVideoChatPage;
