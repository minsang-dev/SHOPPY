import React from 'react';
import './MobileCameraStage.css';

interface MobileCameraStageProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  hasVideo?: boolean;
}

const MobileCameraStage: React.FC<MobileCameraStageProps> = ({ videoRef, hasVideo }) => {
  return (
    <div className="mobile-camera-stage">
      <div className="mobile-camera-title">화면 공유 중</div>
      <div className="mobile-camera-frame">
        {hasVideo ? (
          <video ref={videoRef} className="mobile-camera-video" autoPlay playsInline muted />
        ) : (
          <div className="mobile-camera-placeholder">카메라 화면</div>
        )}
      </div>
    </div>
  );
};

export default MobileCameraStage;
