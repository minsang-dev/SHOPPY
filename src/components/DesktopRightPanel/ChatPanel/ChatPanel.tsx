import React from 'react';
import './ChatPanel.css';

/**
 * 채팅 패널 컴포넌트
 */
const ChatPanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>실시간 채팅</h3>
      <p>채팅 내용이 여기에 표시됩니다.</p>
    </div>
  );
};

export default ChatPanel;
