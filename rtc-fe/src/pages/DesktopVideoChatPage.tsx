import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VideoChatMode, RightPanelType } from '../types/desktopVideoChat.types';
import VideoChatHeader from '../components/DesktopVideoChatHeader/VideoChatHeader';
import RightPanel from '../components/DesktopRightPanel/RightPanel';
import MainPage from './DesktopMainPage';
import './DesktopVideoChatPage.css';


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
          <MainPage />
        </div>
        <div className="video-chat-right">
          <RightPanel panelType={activePanel} />
        </div>
      </div>
    </div>
  );
};

export default DesktopVideoChatPage;
