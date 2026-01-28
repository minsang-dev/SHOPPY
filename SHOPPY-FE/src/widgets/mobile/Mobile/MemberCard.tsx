import React from 'react';
import './MobilePanels.css';

interface MemberCardProps {
  name: string;
  role: string;
  online?: boolean;
  micOn?: boolean;
  onToggleMic?: () => void;
  onSelect?: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  role,
  online = false,
  micOn = true,
  onToggleMic,
  onSelect,
}) => {
  const roleLabel = role === 'HOST' ? '호스트' : '게스트';

  return (
    <div
      className={`member-card ${onSelect ? 'clickable' : ''}`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
    >
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
        <button
          type="button"
          className={`member-icon ${micOn ? 'on' : 'off'}`}
          aria-label="마이크"
          aria-pressed={micOn}
          onClick={(event) => {
            event.stopPropagation();
            onToggleMic?.();
          }}
          disabled={!onToggleMic}
        >
          <i className={micOn ? 'ri-mic-fill' : 'ri-mic-off-fill'} />
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
