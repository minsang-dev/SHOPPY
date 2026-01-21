import React from 'react';
import './MobileTopBar.css';

interface MobileTopBarProps {
  onExit: () => void;
  networkStatus: string;
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onExit,
  networkStatus,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
}) => {
  return (
    <div className="mobile-topbar">
      <button type="button" className="mobile-topbar-exit" onClick={onExit}>
        나가기
      </button>
      <div className="mobile-topbar-status">
        <span className="mobile-topbar-dot" />
        {networkStatus}
      </div>
      <div className="mobile-topbar-controls">
        <button
          type="button"
          className={`mobile-topbar-icon ${micOn ? '' : 'is-off'}`}
          onClick={onToggleMic}
          aria-label="마이크 토글"
        >
          {micOn ? '🎤' : '🔇'}
        </button>
        <button
          type="button"
          className={`mobile-topbar-icon ${camOn ? '' : 'is-off'}`}
          onClick={onToggleCam}
          aria-label="카메라 토글"
        >
          {camOn ? '📷' : '🚫'}
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
