import React, { useState } from 'react';
import './MobilePanels.css';

export interface ChatMessage {
  chat_message_id: number;
  room_id: number;
  sender_user_id: number;
  content: string;
  created_at: string;
  updated_at?: string | null;
}

interface MobileChatPanelProps {
  messages?: ChatMessage[];
  onSendMessage?: (payload: { content: string }) => void;
}

const MobileChatPanel: React.FC<MobileChatPanelProps> = ({ messages = [], onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    onSendMessage?.({ content: input.trim() });
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
            {messages.map((message) => (
              <div key={message.chat_message_id} className="mobile-panel-chat-item">
                <span className="mobile-panel-chat-name">
                  USER {message.sender_user_id} ·{' '}
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
                <span className="mobile-panel-chat-content">{message.content}</span>
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
