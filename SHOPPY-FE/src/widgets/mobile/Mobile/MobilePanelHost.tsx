import React from 'react';
import MobileCartPanel from './MobileCartPanel';
import MobileChatPanel from './MobileChatPanel';
import MobileMembersPanel from './MobileMembersPanel';
import MobileVotePanel from './MobileVotePanel';
import type { VoteData } from './MobileVotePanel';

export type PanelType = 'cart' | 'vote' | 'members' | 'chat';

interface MobilePanelHostProps {
  activePanel: PanelType;
  roomId?: string;
  totalParticipants?: number;
  vote?: VoteData;
  onCreateVote?: (payload: { title: string; options: string[] }) => void;
  onVote?: (optionId: number) => void;
  onEndShopping?: () => void;
}

const MobilePanelHost: React.FC<MobilePanelHostProps> = ({
  activePanel,
  roomId,
  totalParticipants,
  vote,
  onCreateVote,
  onVote,
  onEndShopping,
}) => {
  switch (activePanel) {
    case 'vote':
      return (
        <MobileVotePanel
          totalParticipants={totalParticipants}
          vote={vote}
          onCreateVote={onCreateVote}
          onVote={onVote}
        />
      );
    case 'members':
      return <MobileMembersPanel roomId={roomId} />;
    case 'chat':
      return <MobileChatPanel roomId={roomId} />;
    case 'cart':
    default:
      return <MobileCartPanel roomId={roomId} onEndShopping={onEndShopping} />;
  }
};

export default MobilePanelHost;
