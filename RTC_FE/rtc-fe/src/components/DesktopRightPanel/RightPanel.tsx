import React, { useState } from 'react';
import type { RightPanelType } from '../../types/desktopVideoChat.types';
import { useCartStore } from '../../stores/useCartStore';
import './RightPanel.css';

interface DesktopRightPanelProps {
  panelType: RightPanelType;
}

const RightPanel: React.FC<DesktopRightPanelProps> = ({ panelType }) => {
  const [cartType, setCartType] = useState<'online' | 'offline'>('online');
  const [expandedParticipants, setExpandedParticipants] = useState<Record<number, boolean>>({});
  
  const {
    onlineCartItems,
    offlineCartItems,
    updateQuantity,
    removeFromCart,
    toggleLike,
    toggleDislike,
  } = useCartStore();

  const currentCartItems = cartType === 'online' ? onlineCartItems : offlineCartItems;

  const renderCartContent = () => {
    return (
      <div className="panel-content cart-panel">
        {/* 온라인/오프라인 토글 */}
        <div className="cart-type-toggle">
          <button
            className={`cart-type-btn ${cartType === 'online' ? 'active' : ''}`}
            onClick={() => setCartType('online')}
          >
            온라인 장바구니
          </button>
          <button
            className={`cart-type-btn ${cartType === 'offline' ? 'active' : ''}`}
            onClick={() => setCartType('offline')}
          >
            오프라인 장바구니
          </button>
        </div>

        {/* 장바구니 아이템 목록 */}
        <div className="cart-items-list">
          {currentCartItems.length === 0 ? (
            <div className="empty-cart">
              <p>장바구니가 비어있습니다.</p>
            </div>
          ) : (
            currentCartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                {/* 이미지와 상품 정보를 좌우로 배치 */}
                <div className="cart-item-content">
                  <div className="cart-item-image">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">{item.price.toLocaleString()}원</p>
                    
                    <div className="cart-item-controls">
                      {/* 수량 조절 */}
                      <div className="quantity-control">
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.product_id, (item.quantity || 1) - 1, cartType === 'online')}
                          disabled={(item.quantity || 1) <= 1}
                          aria-label="수량 감소"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="quantity-value">{item.quantity || 1}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.product_id, (item.quantity || 1) + 1, cartType === 'online')}
                          aria-label="수량 증가"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                      
                      {/* 삭제 버튼 */}
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.product_id, cartType === 'online')}
                        aria-label="삭제"
                      >
                        <i className="ri-delete-bin-6-line"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 온라인 장바구니에만 표시: 구분선, 투표, 참여자 토글 */}
                {cartType === 'online' && (
                  <>
                    <div className="cart-item-divider"></div>
                    <div className="cart-item-footer">
                      {/* 좌측: 이모지 투표 */}
                      <div className="cart-item-votes">
                        <button
                          className="vote-btn like-btn"
                          onClick={() => toggleLike(item.product_id)}
                          aria-label="좋아요"
                        >
                          <i className="ri-thumb-up-line"></i>
                          <span>{item.likes || 0}</span>
                        </button>
                        <button
                          className="vote-btn dislike-btn"
                          onClick={() => toggleDislike(item.product_id)}
                          aria-label="싫어요"
                        >
                          <i className="ri-thumb-down-line"></i>
                          <span>{item.dislikes || 0}</span>
                        </button>
                      </div>

                      {/* 우측: 참여자 토글 버튼 */}
                      <button
                        className="participants-toggle-btn"
                        onClick={() => setExpandedParticipants(prev => ({
                          ...prev,
                          [item.product_id]: !prev[item.product_id]
                        }))}
                        aria-label="참여자 목록"
                      >
                        <i className="ri-user-line"></i>
                        <span>{item.participants?.length || 0}</span>
                        {expandedParticipants[item.product_id] && (
                          <div className="participants-dropdown">
                            <p>정산 참여자 (구현 예정)</p>
                          </div>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderPanelContent = () => {
    switch (panelType) {
      case 'cart':
        return renderCartContent();
      case 'participants':
        return (
          <div className="panel-content">
            <h3>참여자 목록</h3>
            <p>참여자 목록이 여기에 표시됩니다.</p>
          </div>
        );
      case 'vote':
        return (
          <div className="panel-content">
            <h3>투표</h3>
            <p>투표 내용이 여기에 표시됩니다.</p>
          </div>
        );
      case 'chat':
        return (
          <div className="panel-content">
            <h3>실시간 채팅</h3>
            <p>채팅 내용이 여기에 표시됩니다.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="right-panel">{renderPanelContent()}</div>;
};

export default RightPanel;
