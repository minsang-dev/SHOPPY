import React from 'react';
import './VotePanel.css';

/**
 * 투표 패널 컴포넌트
 */
const VotePanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>투표</h3>
      <p>투표 내용이 여기에 표시됩니다.</p>
    </div>
  );
};

export default VotePanel;
