import React from 'react';
import './MobilePanels.css';

const MobileVotePanel: React.FC = () => {
  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">투표</div>
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">진행 중인 투표</div>
        <div className="mobile-panel-empty">현재 진행 중인 투표가 없습니다.</div>
      </div>
    </section>
  );
};

export default MobileVotePanel;
