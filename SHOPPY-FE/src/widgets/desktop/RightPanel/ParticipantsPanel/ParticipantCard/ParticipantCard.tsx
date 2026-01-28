import React from 'react';
import type { RoomMember } from '@/entities/room/types/room.types';
import './ParticipantCard.css';

interface ParticipantCardProps {
  participant: RoomMember;
  onSelect?: (participant: RoomMember) => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onSelect }) => {
  // 초성 추출 (첫 글자)
  const getInitial = (name: string): string => {
    return name.charAt(0);
  };

  const isActive = participant.isCameraOn; // 향후 음성 발화 감지로 변경
  const isHost = participant.role === 'HOST';

  return (
    <div
      className={`participant-card ${isActive ? 'active' : 'inactive'} ${onSelect ? 'clickable' : ''}`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(participant)}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(participant);
        }
      }}
    >
      {/* 아바타 */}
      <div className="participant-card-avatar">
        <div className={`participant-card-avatar-inner ${isActive ? 'active' : ''}`}>
          {getInitial(participant.nickname)}
        </div>
      </div>

      {/* 참여자 정보 */}
      <div className="participant-card-info">
        <div className="participant-card-name">
          <span>{participant.nickname}</span>
          {isHost && (
            <i className="ri-vip-crown-fill participant-crown-icon" aria-label="호스트"></i>
          )}
        </div>
        <div className="participant-card-icons">
          {/* 카메라 아이콘 */}
          <i
            className={`${isActive ? 'ri-camera-fill' : 'ri-camera-off-line'} participant-icon ${isActive ? 'active' : 'inactive'}`}
            aria-label={isActive ? '카메라 켜짐' : '카메라 꺼짐'}
          ></i>
          {/* 마이크 아이콘 */}
          <i
            className={`${isActive ? 'ri-mic-fill' : 'ri-mic-off-fill'} participant-icon ${isActive ? 'active' : 'inactive'}`}
            aria-label={isActive ? '마이크 켜짐' : '마이크 꺼짐'}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;
