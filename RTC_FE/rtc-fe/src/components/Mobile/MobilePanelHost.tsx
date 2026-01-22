import React from 'react';
import MobileCartPanel from './MobileCartPanel';
import MobileChatPanel from './MobileChatPanel';
import MobileMembersPanel from './MobileMembersPanel';
import MobileVotePanel from './MobileVotePanel';

export type PanelType = 'cart' | 'vote' | 'members' | 'chat';

interface MobilePanelHostProps {
  activePanel: PanelType;
}

const MobilePanelHost: React.FC<MobilePanelHostProps> = ({ activePanel }) => {
  switch (activePanel) {
    case 'vote':
      return <MobileVotePanel />;
    case 'members':
      return <MobileMembersPanel />;
    case 'chat':
      return <MobileChatPanel />;
    case 'cart':
    default:
      return <MobileCartPanel />;
  }
};

export default MobilePanelHost;
