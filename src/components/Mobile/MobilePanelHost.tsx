import React from 'react';
import MobileCartPanel from './MobileCartPanel';
import MobileChatPanel from './MobileChatPanel';
import type { ChatMessage } from './MobileChatPanel';
import MobileMembersPanel from './MobileMembersPanel';
import MobileVotePanel from './MobileVotePanel';
import type { VoteData } from './MobileVotePanel';

export type PanelType = 'cart' | 'vote' | 'members' | 'chat';

interface MobilePanelHostProps {
  activePanel: PanelType;
  totalParticipants?: number;
  vote?: VoteData;
  onCreateVote?: (payload: { title: string; options: string[] }) => void;
  onVote?: (optionId: number) => void;
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (payload: { content: string }) => void;
  onEndShopping?: () => void;
}

const MobilePanelHost: React.FC<MobilePanelHostProps> = ({
  activePanel,
  totalParticipants,
  vote,
  onCreateVote,
  onVote,
  chatMessages,
  onSendChatMessage,
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
      return <MobileMembersPanel />;
    case 'chat':
      return <MobileChatPanel messages={chatMessages} onSendMessage={onSendChatMessage} />;
    case 'cart':
    default:
      return <MobileCartPanel onEndShopping={onEndShopping} />;
  }
};

export default MobilePanelHost;
