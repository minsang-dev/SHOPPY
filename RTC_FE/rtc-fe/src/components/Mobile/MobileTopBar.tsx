import React from 'react';
import './MobileTopBar.css';

interface MobileTopBarProps {
  onExit: () => void;
  title: string;
  backLabel: string;
  micOnLabel: string;
  micOffLabel: string;
  camOnLabel: string;
  camOffLabel: string;
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}

const BackIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path
      d="M15.5 5.5 9 12l6.5 6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MicOnIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path
      d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const MicOffIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path
      d="M12 3a3 3 0 0 0-3 3v2.5m6 3.5V6a3 3 0 0 0-1.1-2.3M5 11v1a7 7 0 0 0 11.3 5.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M3 3 21 21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CamOnIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <rect
      x="3.5"
      y="7"
      width="12"
      height="10"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m15.5 9 5-2v10l-5-2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const CamOffIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <rect
      x="3.5"
      y="7"
      width="12"
      height="10"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m15.5 9 5-2v10l-5-2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M3 3 21 21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onExit,
  title,
  backLabel,
  micOnLabel,
  micOffLabel,
  camOnLabel,
  camOffLabel,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
}) => {
  return (
    <div className="mobile-topbar">
      <button type="button" className="mobile-topbar-exit" onClick={onExit} aria-label={backLabel}>
        <BackIcon />
      </button>
      <div className="mobile-topbar-title">{title}</div>
      <div className="mobile-topbar-controls">
        <button
          type="button"
          className={`mobile-topbar-icon ${micOn ? '' : 'is-off'}`}
          onClick={onToggleMic}
          aria-label={micOn ? micOnLabel : micOffLabel}
        >
          {micOn ? <MicOnIcon /> : <MicOffIcon />}
        </button>
        <button
          type="button"
          className={`mobile-topbar-icon ${camOn ? '' : 'is-off'}`}
          onClick={onToggleCam}
          aria-label={camOn ? camOnLabel : camOffLabel}
        >
          {camOn ? <CamOnIcon /> : <CamOffIcon />}
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
