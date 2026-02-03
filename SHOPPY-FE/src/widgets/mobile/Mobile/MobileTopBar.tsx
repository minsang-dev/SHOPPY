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
  onSwitchCamera: () => void;
  cameraFacingMode: 'user' | 'environment';
  cameraSwitchLabel: string;
  showControls?: boolean;
}

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
  onSwitchCamera,
  cameraFacingMode,
  cameraSwitchLabel,
  showControls = true,
}) => {
  const handleExit = () => {
    if (window.confirm('정말로 나가시겠습니까?')) {
      onExit();
    }
  };

  return (
    <div className="mobile-topbar">
      <button type="button" className="mobile-topbar-exit" onClick={handleExit} aria-label={backLabel}>
        <i className="ri-arrow-left-line" />
      </button>
      <div className="mobile-topbar-title">{title}</div>
      {showControls && (
        <div className="mobile-topbar-controls">
          <button
            type="button"
            className={`mobile-topbar-icon ${micOn ? '' : 'is-off'}`}
            onClick={onToggleMic}
            aria-label={micOn ? micOnLabel : micOffLabel}
          >
            <i className={micOn ? 'ri-mic-fill' : 'ri-mic-off-fill'} />
          </button>
          <button
            type="button"
            className={`mobile-topbar-icon ${camOn ? '' : 'is-off'}`}
            onClick={onToggleCam}
            aria-label={camOn ? camOnLabel : camOffLabel}
          >
            <i className={camOn ? 'ri-camera-fill' : 'ri-camera-off-line'} />
          </button>
          <button
            type="button"
            className="mobile-topbar-icon"
            onClick={onSwitchCamera}
            aria-label={cameraSwitchLabel}
            title={cameraSwitchLabel}
            disabled={!camOn}
            data-facing={cameraFacingMode}
          >
            <i className="ri-camera-switch-line" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileTopBar;
