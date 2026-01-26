import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRoomMembers } from '@/entities/room/api/room';
import type { RoomMember } from '@/entities/room/types/room.types';
import ParticipantCard from './ParticipantCard/ParticipantCard';
import './ParticipantsPanel.css';

/**
 * 참여자 목록 패널 컴포넌트
 */
const ParticipantsPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [participants, setParticipants] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('참여자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [roomId]);

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
            <ParticipantCard key={participant.memberId} participant={participant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantsPanel;
