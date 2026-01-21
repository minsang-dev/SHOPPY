import React, { useState } from 'react';
import MobileBottomNav from '../components/Mobile/MobileBottomNav';
import MobileCameraStage from '../components/Mobile/MobileCameraStage';
import MobilePanelHost from '../components/Mobile/MobilePanelHost';
import type { PanelType } from '../components/Mobile/MobilePanelHost';
import MobileTopBar from '../components/Mobile/MobileTopBar';
import './MobileVideoChatPage.css';

const MobileVideoChatPage: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>('cart');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const handleExit = () => {
    console.log('나가기');
  };

  const handleToggleMic = () => {
    setMicOn((prev) => !prev);
  };

  const handleToggleCam = () => {
    setCamOn((prev) => !prev);
  };

  return (
    <div className="mobile-room-page">
      <div className="mobile-room-shell">
        <MobileTopBar
          onExit={handleExit}
          networkStatus="LTE"
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
