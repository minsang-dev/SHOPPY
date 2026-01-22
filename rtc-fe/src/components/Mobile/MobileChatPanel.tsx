import React, { useState } from 'react';
import './MobilePanels.css';

const MobileChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    setMessages((prev) => [...prev, input]);
    setInput('');
  };

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">채팅</div>
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">실시간 메시지</div>
        {messages.length === 0 ? (
          <div className="mobile-panel-empty">아직 메시지가 없습니다.</div>
        ) : (
          <div className="mobile-panel-chat-list">
            {messages.map((message, index) => (
              <div key={`${message}-${index}`} className="mobile-panel-chat-item">
                <span className="mobile-panel-chat-content">{message}</span>
              </div>
            ))}
          </div>
        )}
        <form className="mobile-panel-chat-form" onSubmit={handleSubmit}>
          <input
            className="mobile-panel-chat-input"
            type="text"
            value={input}
            placeholder="메시지 입력"
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" className="mobile-panel-chat-send">
            전송
          </button>
        </form>
      </div>
    </section>
  );
};

export default MobileChatPanel;
