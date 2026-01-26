import React from 'react';
import { useRoomMembers } from '../../../features/room/fetch-members/model/useRoomMembers';
import MemberCard from './MemberCard';
import './MobilePanels.css';

interface MobileMembersPanelProps {
  roomId?: string;
}

const MobileMembersPanel: React.FC<MobileMembersPanelProps> = ({ roomId }) => {
  const { members, loading, error } = useRoomMembers(roomId);

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">참여자</div>
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">현재 참여자</div>
        {loading ? (
          <div className="mobile-panel-empty">불러오는 중...</div>
        ) : error ? (
          <div className="mobile-panel-empty">{error}</div>
        ) : members.length === 0 ? (
          <div className="mobile-panel-empty">참여자가 없습니다.</div>
        ) : (
          <div className="mobile-panel-members">
            {members.map((member) => (
              <MemberCard
                key={member.memberId}
                name={member.nickname}
                role={member.role}
                online={member.status === 'ACTIVE'}
                camOn={member.isCameraOn}
                micOn={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MobileMembersPanel;
