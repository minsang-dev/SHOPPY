import React, { useMemo, useState } from 'react';
import { useRoomMembersContext } from '../../../features/room/fetch-members/model/RoomMembersProvider';
import MemberCard from './MemberCard';
import ParticipantVolumeModal from '../../../shared/ui/ParticipantVolumeModal';
import './MobilePanels.css';

/**
 * 모바일 참여자 목록 패널
 * WebSocket 구독은 RoomMembersProvider(페이지 레벨)에서 처리
 */
const MobileMembersPanel: React.FC = () => {
  const { members, loading, error } = useRoomMembersContext();
  const [micStates, setMicStates] = useState<Record<number, boolean>>({});
  const [volumeStates, setVolumeStates] = useState<Record<number, number>>({});
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const memberMicStates = useMemo(() => {
    const next: Record<number, boolean> = {};
    members.forEach((member) => {
      next[member.memberId] = micStates[member.memberId] ?? true;
    });
    return next;
  }, [members, micStates]);

  const selectedMember = useMemo(
    () => members.find((member) => member.memberId === selectedMemberId) ?? null,
    [members, selectedMemberId],
  );

  const selectedVolume = selectedMember
    ? volumeStates[selectedMember.memberId] ?? 100
    : 100;

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-card">
        <div className="mobile-panel-header is-inline">
          <div className="mobile-panel-title">현재 참여자</div>
        </div>
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
                micOn={memberMicStates[member.memberId]}
                onToggleMic={() =>
                  setMicStates((prev) => ({
                    ...prev,
                    [member.memberId]: !(prev[member.memberId] ?? true),
                  }))
                }
                onSelect={() => setSelectedMemberId(member.memberId)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedMember && (
        <ParticipantVolumeModal
          isOpen={true}
          participantName={selectedMember.nickname}
          volume={selectedVolume}
          onChange={(value) =>
            setVolumeStates((prev) => ({
              ...prev,
              [selectedMember.memberId]: value,
            }))
          }
          onClose={() => setSelectedMemberId(null)}
        />
      )}
    </section>
  );
};

export default MobileMembersPanel;
