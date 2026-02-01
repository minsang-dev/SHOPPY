import React from 'react';
import './MobileCameraStage.css';

interface MobileCameraStageProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  hasVideo?: boolean;
  mirror?: boolean;
}

const MobileCameraStage: React.FC<MobileCameraStageProps> = ({ videoRef, hasVideo, mirror }) => {
  return (
    <div className="mobile-camera-stage">
      <div className="mobile-camera-frame">
        <video
          ref={videoRef}
          className={`mobile-camera-video ${hasVideo ? 'is-visible' : 'is-hidden'} ${mirror ? 'is-mirrored' : ''}`}
          autoPlay
          playsInline
          muted
        />
        {!hasVideo && <div className="mobile-camera-placeholder">카메라 화면</div>}
      </div>
    </div>
  );
};

export default MobileCameraStage;
