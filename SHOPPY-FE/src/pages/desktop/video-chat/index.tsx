import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import type { VideoChatMode, RightPanelType } from '../../../entities/room/types/desktopVideoChat.types';
import VideoChatHeader from '../../../widgets/desktop/DesktopVideoChatHeader/VideoChatHeader';
import RightPanel from '../../../widgets/desktop/DesktopRightPanel/RightPanel';
import './styles.css';


const DesktopVideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<VideoChatMode>('personal');
  const [activePanel, setActivePanel] = useState<RightPanelType>('cart');

  const handleExit = () => {
    navigate('/');
  };

  const handleModeChange = (newMode: VideoChatMode) => {
    setMode(newMode);
  };

  const handlePanelToggle = (panel: RightPanelType) => {
    setActivePanel(panel);
  };

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
