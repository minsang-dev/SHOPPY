import React, { useState } from 'react';
import type { Participant, ParticipantSelectionStatus } from '../../../../../entities/participant/types/participant.types';
import './ParticipantAvatar.css';

interface ParticipantAvatarProps {
  participant: Participant;
  status: ParticipantSelectionStatus;
  onStatusToggle: (memberId: number) => void;
}

/**
 * 참여자 아바타 컴포넌트
 * 프로필 사진 또는 초성으로 표시하고, 체크/X 상태를 토글할 수 있음
 */
const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  participant,
  status,
  onStatusToggle,
}) => {
  // 마우스 호버 시 툴팁 형태로 참여자 이름 표시 여부 관리
  const [showTooltip, setShowTooltip] = useState(false);
  
  // 초성 추출 (첫 글자)
  const getInitial = (name: string): string => {
    return name.charAt(0);
  };

  // 참여자 선택 토글
  const handleClick = () => {
    onStatusToggle(participant.member_id);
  };

  return (
    <div className="participant-avatar-container">
      <div
        className="participant-avatar"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="button"
        tabIndex={0}
        aria-label={`${participant.name}`}
      >
        {/* 프로필 이미지 또는 초성 */}
        {participant.user_id ? (
          <div className="participant-image">
            {/* 실제 프로필 이미지가 있다면 img 태그 사용 */}
            <div className="participant-image-placeholder">
              {getInitial(participant.name)}
            </div>
          </div>
        ) : (
          <div className="participant-initial">
            {getInitial(participant.name)}
          </div>
        )}

        {/* 상태 아이콘 (체크 또는 X) */}
        <div className={`participant-status ${status}`}>
          {status === 'checked' ? (
            <i className="ri-checkbox-circle-fill"></i>
          ) : (
            <i className="ri-close-circle-fill"></i>
          )}
        </div>
      </div>

      {/* 툴팁 */}
      {showTooltip && (
        <div className="participant-tooltip">
          {participant.name}
        </div>
      )}
    </div>
  );
};

export default ParticipantAvatar;
