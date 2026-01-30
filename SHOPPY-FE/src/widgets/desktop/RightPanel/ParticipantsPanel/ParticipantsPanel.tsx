import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomInfo } from '@/features/room/fetch-room/model/useRoomInfo';
import { useRoomMembers } from '@/features/room/fetch-members/model/useRoomMembers';
import ParticipantCard from './ParticipantCard/ParticipantCard';
import ParticipantVolumeModal from '@/shared/ui/ParticipantVolumeModal';
import { realtimeConfig } from '@/shared/config/realtime';
import { useAuthStore } from '@/entities/user';
import { useMediaControlStore } from '@/features/video-chat/model/useMediaControlStore';
import { useRemoteMediaControlStore } from '@/features/video-chat/model/useRemoteMediaControlStore';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicRoomsMembers,
} from '@/shared/lib/realtime';
import './ParticipantsPanel.css';

/**
 * 참여자 목록 패널 컴포넌트
 */
const ParticipantsPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { members, loading, error, applyEvent } = useRoomMembers(roomId);
  const [volumeStates, setVolumeStates] = useState<Record<number, number>>({});
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const { room } = useRoomInfo(roomId);
  const user = useAuthStore((state) => state.user);
  const micOn = useMediaControlStore((state) => state.micOn);
  const camOn = useMediaControlStore((state) => state.camOn);
  const toggleMic = useMediaControlStore((state) => state.toggleMic);
  const toggleCam = useMediaControlStore((state) => state.toggleCam);
  const toggleRemoteMic = useRemoteMediaControlStore((state) => state.toggleMute);
  const toggleRemoteCam = useRemoteMediaControlStore((state) => state.toggleHide);
  const storedMemberId = useMemo(() => {
    const raw = localStorage.getItem('memberId');
    return raw ? Number(raw) : null;
  }, []);

  const handleCopyInviteCode = async () => {
    if (!room?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(room.inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('초대코드 복사 실패:', err);
    }
  };

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

  const selectedParticipant = useMemo(
    () => members.find((p) => p.memberId === selectedParticipantId) ?? null,
    [members, selectedParticipantId],
  );

  const selectedVolume = selectedParticipant
    ? volumeStates[selectedParticipant.memberId] ?? 100
    : 100;

  return (
    <div className="panel-content">
      <h3>참여자 목록</h3>
      {loading ? (
        <div className="participants-loading">
          <p>로딩 중...</p>
        </div>
      ) : error ? (
        <div className="participants-error">
          <p>{error}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="participants-empty">
          <p>참여자가 없습니다.</p>
        </div>
      ) : (
        <div className="participants-list">
          {members.map((participant) => (
            <ParticipantCard
              key={participant.memberId}
              participant={participant}
              onSelect={(p) => setSelectedParticipantId(p.memberId)}
              isSelf={
                Boolean(user && participant.userId && user.id === participant.userId) ||
                (storedMemberId !== null && participant.memberId === storedMemberId)
              }
              micOn={micOn}
              camOn={camOn}
              onToggleMic={toggleMic}
              onToggleCam={toggleCam}
              onToggleRemoteMic={() => toggleRemoteMic(participant.nickname)}
              onToggleRemoteCam={() => toggleRemoteCam(participant.nickname)}
            />
          ))}
        </div>
      )}

      <button
        className="invite-code-button"
        onClick={handleCopyInviteCode}
        disabled={!room?.inviteCode}
      >
        {copySuccess ? '복사 완료!' : '초대코드 복사'}
      </button>

      {selectedParticipant && (
        <ParticipantVolumeModal
          isOpen={true}
          participantName={selectedParticipant.nickname}
          volume={selectedVolume}
          onChange={(value) =>
            setVolumeStates((prev) => ({
              ...prev,
              [selectedParticipant.memberId]: value,
            }))
          }
          onClose={() => setSelectedParticipantId(null)}
        />
      )}
    </div>
  );
};

export default ParticipantsPanel;
