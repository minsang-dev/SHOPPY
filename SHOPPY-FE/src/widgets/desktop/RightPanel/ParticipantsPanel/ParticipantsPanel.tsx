import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomInfo } from '@/features/room/fetch-room/model/useRoomInfo';
import { useRoomMembersContext } from '@/features/room/fetch-members/model/RoomMembersProvider';
import ParticipantCard from './ParticipantCard/ParticipantCard';
import ParticipantVolumeModal from '@/shared/ui/ParticipantVolumeModal';
import { useAuthStore } from '@/entities/user';
import { useMediaControlStore } from '@/features/video-chat/model/useMediaControlStore';
import { useRemoteMediaControlStore } from '@/features/video-chat/model/useRemoteMediaControlStore';
import './ParticipantsPanel.css';

/**
 * 참여자 목록 패널 컴포넌트
 * WebSocket 구독은 RoomMembersProvider(페이지 레벨)에서 처리
 */
const ParticipantsPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { members, loading, error } = useRoomMembersContext();
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
  const mutedByNickname = useRemoteMediaControlStore((state) => state.mutedByNickname);
  const hiddenByNickname = useRemoteMediaControlStore((state) => state.hiddenByNickname);
  const storedMemberId = useMemo(() => {
    const raw = sessionStorage.getItem('memberId');
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

  // WebSocket 구독은 DesktopVideoChatPage에서 처리 (패널 전환 시 연결 끊김 방지)

  const selectedParticipant = useMemo(
    () => members.find((p) => p.memberId === selectedParticipantId) ?? null,
    [members, selectedParticipantId],
  );

  const selectedVolume = selectedParticipant
    ? volumeStates[selectedParticipant.memberId] ?? 100
    : 100;

  /** 입장 순서(joinedAt)에 따라 정렬 - 1번째 입장 = 색상 1번, 2번째 = 2번, ... 11번째 = 1번 */
  const membersByJoinOrder = useMemo(
    () => [...members].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()),
    [members],
  );

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
          {membersByJoinOrder.map((participant, index) => {
            const isSelf =
              Boolean(user && participant.userId && user.id === participant.userId) ||
              (storedMemberId !== null && participant.memberId === storedMemberId);
            return (
            <ParticipantCard
              key={participant.memberId}
              participant={participant}
              colorKey={index}
              onSelect={(p) => setSelectedParticipantId(p.memberId)}
              isSelf={isSelf}
              micOn={micOn}
              camOn={camOn}
              remoteMicMuted={Boolean(mutedByNickname[participant.nickname])}
              remoteCamHidden={Boolean(hiddenByNickname[participant.nickname])}
              onToggleMic={toggleMic}
              onToggleCam={toggleCam}
              onToggleRemoteMic={() => toggleRemoteMic(participant.nickname)}
              onToggleRemoteCam={() => toggleRemoteCam(participant.nickname)}
            />
            );
          })}
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
