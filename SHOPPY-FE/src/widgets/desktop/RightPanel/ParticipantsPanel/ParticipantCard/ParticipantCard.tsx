import React from 'react';
import type { RoomMember } from '@/entities/room/types/room.types';
import UserAvatar from '@/shared/ui/UserAvatar';
import './ParticipantCard.css';

interface ParticipantCardProps {
  participant: RoomMember;
  /** 입장 순서 인덱스 (0~9) - 10개 색상 목록 순서와 일치 */
  colorKey?: number;
  onSelect?: (participant: RoomMember) => void;
  isSelf?: boolean;
  micOn?: boolean;
  camOn?: boolean;
  remoteMicMuted?: boolean;
  remoteCamHidden?: boolean;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  onToggleRemoteMic?: () => void;
  onToggleRemoteCam?: () => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  colorKey,
  onSelect,
  isSelf = false,
  micOn,
  camOn,
  remoteMicMuted = false,
  remoteCamHidden = false,
  onToggleMic,
  onToggleCam,
  onToggleRemoteMic,
  onToggleRemoteCam,
}) => {
  const isActive = isSelf
    ? camOn ?? participant.isCameraOn
    : participant.isCameraOn && !remoteCamHidden;
  const isMicOn = isSelf ? micOn ?? true : !remoteMicMuted;
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
      <div className={`participant-card-avatar ${isActive ? 'active' : ''}`}>
        <UserAvatar
          name={participant.nickname}
          colorKey={colorKey ?? participant.memberId}
          size="lg"
        />
      </div>

      {/* 참여자 정보 */}
      <div className="participant-card-info">
        <div className="participant-card-name">
          <span>{participant.nickname}</span>
          {isHost && (
            <span className="participant-host-badge" aria-label="호스트">
              <i className="ri-vip-crown-fill" aria-hidden />
              호스트
            </span>
          )}
        </div>
        <div className="participant-card-icons">
          {/* 카메라 아이콘 */}
          <i
            className={`${isActive ? 'ri-camera-fill' : 'ri-camera-off-line'} participant-icon ${isActive ? 'active' : 'inactive'} ${(isSelf || onToggleRemoteCam) ? 'clickable' : ''}`}
            aria-label={isActive ? '카메라 켜짐' : '카메라 꺼짐'}
            onClick={(event) => {
              event.stopPropagation();
              if (isSelf) {
                onToggleCam?.();
                return;
              }
              onToggleRemoteCam?.();
            }}
          ></i>
          {/* 마이크 아이콘 */}
          <i
            className={`${isMicOn ? 'ri-mic-fill' : 'ri-mic-off-fill'} participant-icon ${isMicOn ? 'active' : 'inactive'} ${(isSelf || onToggleRemoteMic) ? 'clickable' : ''}`}
            aria-label={isMicOn ? '마이크 켜짐' : '마이크 꺼짐'}
            onClick={(event) => {
              event.stopPropagation();
              if (isSelf) {
                onToggleMic?.();
                return;
              }
              onToggleRemoteMic?.();
            }}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;
