import React, { useState } from 'react';
import './MobilePanels.css';

const MobileCartPanel: React.FC = () => {
  const [cartType, setCartType] = useState<'online' | 'offline'>('online');

  return (
    <section className="mobile-panel">
      <div className="mobile-panel-pill">장바구니</div>
      <div className="mobile-panel-toggle">
        <button
          type="button"
          className={`mobile-panel-toggle-button ${cartType === 'online' ? 'active' : ''}`}
          onClick={() => setCartType('online')}
        >
          온라인
        </button>
        <button
          type="button"
          className={`mobile-panel-toggle-button ${cartType === 'offline' ? 'active' : ''}`}
          onClick={() => setCartType('offline')}
        >
          오프라인
        </button>
      </div>
      <div className="mobile-panel-card">
        <div className="mobile-panel-title">
          {cartType === 'online' ? 'AI 추천 위시리스트' : '현장 쇼핑 목록'}
        </div>
        <div className="mobile-panel-empty">등록된 상품이 없습니다.</div>
      </div>
      <div className="mobile-panel-actions">
        <button type="button" className="mobile-panel-action">
          🎤 음성 입력
        </button>
        <button type="button" className="mobile-panel-action">
          ⌨️ 수동 입력
        </button>
      </div>
    </section>
  );
};

export default MobileCartPanel;
