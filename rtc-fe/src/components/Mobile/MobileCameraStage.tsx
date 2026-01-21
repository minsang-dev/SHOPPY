import React from 'react';
import './MobileCameraStage.css';

const MobileCameraStage: React.FC = () => {
  return (
    <div className="mobile-camera-stage">
      <div className="mobile-camera-title">홍길동님이 화면 공유 중</div>
      <div className="mobile-camera-frame">
        <div className="mobile-camera-placeholder">카메라 화면</div>
      </div>
    </div>
  );
};

export default MobileCameraStage;
