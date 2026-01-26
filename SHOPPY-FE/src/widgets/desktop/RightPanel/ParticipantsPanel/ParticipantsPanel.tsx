import React, { useEffect, useState } from 'react';
import { getMemberList } from '../../../../entities/participant/api/memberListApi';
import type { Participant } from '../../../../entities/participant/types/participant.types';
import ParticipantCard from './ParticipantCard/ParticipantCard';
import './ParticipantsPanel.css';

/**
 * 참여자 목록 패널 컴포넌트
 */
const ParticipantsPanel: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMemberList();
        setParticipants(data);
      } catch (err) {
        console.error('참여자 목록 조회 실패:', err);
        setError('참여자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

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
            <ParticipantCard key={participant.member_id} participant={participant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantsPanel;
