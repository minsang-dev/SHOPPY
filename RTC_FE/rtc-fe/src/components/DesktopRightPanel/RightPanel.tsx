import React from 'react';
import type { RightPanelType } from '../../types/desktopVideoChat.types';
import './RightPanel.css';

interface DesktopRightPanelProps {
  panelType: RightPanelType;
}

const RightPanel: React.FC<DesktopRightPanelProps> = ({ panelType }) => {

  const renderPanelContent = () => {
    switch (panelType) {
      case 'cart':
        return (
          <div className="panel-content">
            <h3>장바구니</h3>
            <p>장바구니 내용이 여기에 표시됩니다.</p>
          </div>
        );
      case 'participants':
        return (
          <div className="panel-content">
            <h3>참여자 목록</h3>
            <p>참여자 목록이 여기에 표시됩니다.</p>
          </div>
        );
      case 'vote':
        return (
          <div className="panel-content">
            <h3>투표</h3>
            <p>투표 내용이 여기에 표시됩니다.</p>
          </div>
        );
      case 'chat':
        return (
          <div className="panel-content">
            <h3>실시간 채팅</h3>
            <p>채팅 내용이 여기에 표시됩니다.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="right-panel">{renderPanelContent()}</div>;
};

export default RightPanel;
