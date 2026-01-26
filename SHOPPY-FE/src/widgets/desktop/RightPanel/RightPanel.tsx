import React from 'react';
import type { RightPanelType } from '../../../entities/room/types/desktopVideoChat.types';
import CartPanel from './CartPanel/CartPanel';
import ParticipantsPanel from './ParticipantsPanel/ParticipantsPanel';
import VotePanel from './VotePanel/VotePanel';
import ChatPanel from './ChatPanel/ChatPanel';
import './RightPanel.css';

interface DesktopRightPanelProps {
  panelType: RightPanelType;
}

/**
 * 오른쪽 패널 메인 컴포넌트
 * 패널 타입에 따라 적절한 하위 패널 컴포넌트를 렌더링
 */
const RightPanel: React.FC<DesktopRightPanelProps> = ({ panelType }) => {
  const renderPanelContent = () => {
    switch (panelType) {
      case 'cart':
        return <CartPanel />;
      case 'participants':
        return <ParticipantsPanel />;
      case 'vote':
        return <VotePanel />;
      case 'chat':
        return <ChatPanel />;
      default:
        return null;
    }
  };

  return <div className="right-panel">{renderPanelContent()}</div>;
};

export default RightPanel;
