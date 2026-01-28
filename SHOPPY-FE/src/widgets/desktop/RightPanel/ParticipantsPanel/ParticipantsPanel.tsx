import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import ParticipantCard from './ParticipantCard/ParticipantCard';
import ParticipantVolumeModal from '@/shared/ui/ParticipantVolumeModal';
import './ParticipantsPanel.css';

/**
 * 참여자 목록 패널 컴포넌트
 */
const ParticipantsPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [participants, setParticipants] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [volumeStates, setVolumeStates] = useState<Record<number, number>>({});
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!roomId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getRoomMembers(roomId);
        setParticipants(data);
      } catch (err) {
        console.error('참여자 목록 조회 실패:', err);
        setError('참여자 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [roomId]);

  const selectedParticipant = useMemo(
    () => participants.find((p) => p.memberId === selectedParticipantId) ?? null,
    [participants, selectedParticipantId],
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
      ) : participants.length === 0 ? (
        <div className="participants-empty">
          <p>참여자가 없습니다.</p>
        </div>
      ) : (
        <div className="participants-list">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.memberId}
              participant={participant}
              onSelect={(p) => setSelectedParticipantId(p.memberId)}
            />
          ))}
        </div>
      )}

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
