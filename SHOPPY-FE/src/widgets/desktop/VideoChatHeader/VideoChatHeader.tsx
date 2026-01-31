import React from 'react';
import type { DesktopVideoChatHeaderProps } from '../../../entities/room/types/desktopVideoChat.types';
import './VideoChatHeader.css';

// VideoChatHeader는 함수형 컴포넌트(FC). 꺽쇠 안 규칙을 따름
const VideoChatHeader: React.FC<DesktopVideoChatHeaderProps> = ({
  mode,
  onModeChange,
  onExit,
  activePanel,
  onPanelToggle,
}) => {
  const handleIconClick = (panelType: 'cart' | 'participants' | 'vote' | 'chat') => {
    if (activePanel === panelType) {
      return; // 현재 열려 있는 토글과 방금 누른 아이콘 일치 -> 아무 변화 X
    } 
    // 다를 땐, 방금 누른 아이콘 토글 열림
    onPanelToggle(panelType);
  };

  return (
    <header className="video-chat-header">
      <div className="video-chat-header-container">
        <button className="exit-button" onClick={onExit}>
          나가기
        </button>

        {/* 모드 전환 */}
        <div className="mode-selector">
          <button
            className={`mode-button ${mode === 'personal' ? 'active' : ''}`}
            onClick={() => onModeChange('personal')}
          >
            개인 모드
          </button>
          <button
            className={`mode-button ${mode === 'host' ? 'active' : ''}`}
            onClick={() => onModeChange('host')}
          >
            호스트 모드
          </button>
        </div>

        {/* 우측 상단 아이콘 */}
        <div className="header-icons">
          <button
            className={`header-icon ${activePanel === 'cart' ? 'active' : ''}`}
            onClick={() => handleIconClick('cart')}
            aria-label="장바구니"
          >
            <i className="fa-solid fa-cart-arrow-down"></i>
            <span className="header-icon-tooltip">장바구니</span>
          </button>
          <button
            className={`header-icon ${activePanel === 'participants' ? 'active' : ''}`}
            onClick={() => handleIconClick('participants')}
            aria-label="참여자 목록"
          >
            <i className="fa-solid fa-users"></i>
            <span className="header-icon-tooltip">참여자 목록</span>
          </button>
          <button
            className={`header-icon ${activePanel === 'vote' ? 'active' : ''}`}
            onClick={() => handleIconClick('vote')}
            aria-label="투표"
          >
            <i className="fa-solid fa-check-to-slot"></i>
            <span className="header-icon-tooltip">투표</span>
          </button>
          <button
            className={`header-icon ${activePanel === 'chat' ? 'active' : ''}`}
            onClick={() => handleIconClick('chat')}
            aria-label="실시간 채팅"
          >
            <i className="fa-regular fa-comment-dots"></i>
            <span className="header-icon-tooltip">채팅</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default VideoChatHeader;
