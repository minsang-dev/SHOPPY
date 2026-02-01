import React, { useEffect, useMemo, useState } from 'react';
import { useRoomMembers } from '../../../features/room/fetch-members/model/useRoomMembers';
import MemberCard from './MemberCard';
import ParticipantVolumeModal from '../../../shared/ui/ParticipantVolumeModal';
import { realtimeConfig } from '../../../shared/config/realtime';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicRoomsMembers,
} from '../../../shared/lib/realtime';
import './MobilePanels.css';

interface MobileMembersPanelProps {
  roomId?: string;
}

const MobileMembersPanel: React.FC<MobileMembersPanelProps> = ({ roomId }) => {
  const { members, loading, error, applyEvent } = useRoomMembers(roomId);
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

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token =
      localStorage.getItem('accessToken') ??
      localStorage.getItem('access_token') ??
      undefined;
    if (!token) {
      return;
    }

    const client = createRealtimeClient({ token });
    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) {
          return;
        }
        subscription = subscribeTopic(client, topicRoomsMembers(roomId), (body) => {
          try {
            const payload = JSON.parse(body) as {
              type: 'JOINED' | 'LEFT' | 'STATE_UPDATED';
              member: {
                memberId: number;
                roomId: number;
                userId: number | null;
                nickname: string;
                role: string;
                status: string;
                isCameraOn: boolean;
                joinedAt: string;
              };
            };
            if (payload?.member && payload?.type) {
              applyEvent({ type: payload.type, member: payload.member });
            }
          } catch (err) {
            console.error('Failed to parse member event:', err);
          }
        });
      })
      .catch((err) => {
        console.error('Realtime connection failed:', err);
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [applyEvent, roomId]);

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
