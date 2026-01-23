import React from 'react';
import './MobilePanels.css';

const MobileMembersPanel: React.FC = () => {
  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">참여자 목록</div>
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">현재 참여자</div>
        <div className="mobile-panel-empty">참여 중인 사용자가 없습니다.</div>
      </div>
    </section>
  );
};

export default MobileMembersPanel;
