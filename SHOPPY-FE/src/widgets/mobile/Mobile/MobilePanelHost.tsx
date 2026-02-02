import React from 'react';
import MobileCartPanel from './MobileCartPanel';
import MobileChatPanel from './MobileChatPanel';
import MobileMembersPanel from './MobileMembersPanel';
import MobileVotePanel from './MobileVotePanel';

export type PanelType = 'cart' | 'vote' | 'members' | 'chat';

interface MobilePanelHostProps {
  activePanel: PanelType;
  roomId?: string;
  onEndShopping?: () => void;
}

const MobilePanelHost: React.FC<MobilePanelHostProps> = ({
  activePanel,
  roomId,
  onEndShopping,
}) => {
  switch (activePanel) {
    case 'vote':
      return <MobileVotePanel roomId={roomId} />;
    case 'members':
      return <MobileMembersPanel />;
    case 'chat':
      return <MobileChatPanel roomId={roomId} />;
    case 'cart':
    default:
      return <MobileCartPanel roomId={roomId} onEndShopping={onEndShopping} />;
  }
};

export default MobilePanelHost;
