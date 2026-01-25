import React from 'react';
import './MobilePanels.css';

interface MemberCardProps {
  name: string;
  role: string;
  online?: boolean;
  micOn?: boolean;
  camOn?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  role,
  online = false,
  micOn = true,
  camOn = true,
}) => {
  const roleLabel = role === 'HOST' ? '호스트' : '쇼핑';

  return (
    <div className="member-card">
      <div className="member-avatar" aria-hidden="true">
        {name.slice(0, 1)}
      </div>
      <div className="member-info">
        <div className="member-name-row">
          <span className="member-name">{name}</span>
          <span className={`member-role ${role === 'HOST' ? 'host' : 'guest'}`}>
            {roleLabel}
          </span>
        </div>
        <div className="member-status">
          <span className={`member-dot ${online ? 'online' : 'offline'}`} />
          {online ? '온라인' : '오프라인'}
        </div>
      </div>
      <div className="member-actions">
        <span className={`member-icon ${camOn ? 'on' : 'off'}`} aria-label="카메라">
          <i className={camOn ? 'ri-video-on-fill' : 'ri-video-off-fill'} />
        </span>
        <span className={`member-icon ${micOn ? 'on' : 'off'}`} aria-label="마이크">
          <i className={micOn ? 'ri-mic-fill' : 'ri-mic-off-fill'} />
        </span>
      </div>
    </div>
  );
};

export default MemberCard;
