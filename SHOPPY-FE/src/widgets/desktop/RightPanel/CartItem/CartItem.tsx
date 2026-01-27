import React from 'react';
import type { ShoppingItem } from '@/entities/shopping/types/shopping.types';
import CartItemVotes from '../CartItemVotes/CartItemVotes';
import CartItemParticipants from '../CartItemParticipants/CartItemParticipants';
import './CartItem.css';

interface CartItemProps {
  item: ShoppingItem;
  cartType: 'online' | 'offline';
  isExpanded: boolean;
  onQuantityDecrease: () => void;
  onQuantityIncrease: () => void;
  onRemove: () => void;
  onLike: () => void;
  onDislike: () => void;
  onToggleParticipants: () => void;
  onToggleChecked?: () => void; // 오프라인 장바구니 체크박스용
  likes?: number; // UI 전용 상태
  dislikes?: number; // UI 전용 상태
  participants?: string[]; // UI 전용 상태
}

/**
 * 개별 장바구니 아이템 컴포넌트
 * 상품 정보, 수량 조절, 삭제, 투표, 참여자 기능을 포함
 */
const CartItem: React.FC<CartItemProps> = ({
  item,
  cartType,
  isExpanded,
  onQuantityDecrease,
  onQuantityIncrease,
  onRemove,
  onLike,
  onDislike,
  onToggleParticipants,
  onToggleChecked,
  likes = 0,
  dislikes = 0,
  participants = [],
}) => {
  const quantity = item.quantity;
  const isOnline = cartType === 'online';
  const isChecked = item.is_checked;

  return (
    <div className="cart-item">
      {/* 상품 이미지와 정보 */}
      <div className="cart-item-content">
        {isOnline && item.product_id && (
          <div className="cart-item-image">
            {/* TODO: product_id로 상품 이미지 가져오기 */}
            <div className="cart-item-image-placeholder">이미지</div>
          </div>
        )}
        <div className="cart-item-info">
          <div className="cart-item-name-wrapper">
            {/* 오프라인 장바구니일 때 체크박스 표시 */}
            {!isOnline && onToggleChecked && (
              <input
                type="checkbox"
                className="cart-item-checkbox"
                checked={isChecked}
                onChange={onToggleChecked}
                aria-label={`${item.display_name} 체크`}
              />
            )}
            <div className="cart-item-name-section">
              <h4 className="cart-item-name">{item.display_name}</h4>
              {item.added_by_user_id && (
                <p className="cart-item-added-by">
                  {item.added_by_user_id}님이 추가한 상품
                </p>
              )}
            </div>
          </div>
          {/* <p className="cart-item-price">
            {cartType === 'offline' && item.price === 0 
              ? '미정' 
              : `${item.price.toLocaleString()}원`}
          </p> */}
          
          <div className="cart-item-controls">
            {/* 수량 조절 */}
            <div className="quantity-control">
              <button
                className="quantity-btn"
                onClick={onQuantityDecrease}
                disabled={quantity <= 1}
                aria-label="수량 감소"
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <span className="quantity-value">{quantity}</span>
              <button
                className="quantity-btn"
                onClick={onQuantityIncrease}
                aria-label="수량 증가"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            
            {/* 삭제 버튼 */}
            <button
              className="remove-btn"
              onClick={onRemove}
              aria-label="삭제"
            >
              <i className="ri-delete-bin-6-line"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 투표 및 참여자 (온라인/오프라인 모두 표시) */}
      <div className="cart-item-divider"></div>
      <div className="cart-item-footer">
        <CartItemVotes
          likes={likes}
          dislikes={dislikes}
          onLike={onLike}
          onDislike={onDislike}
        />
        <CartItemParticipants
          productId={item.shopping_item_id}
          participantCount={participants.length}
          isExpanded={isExpanded}
          onToggle={onToggleParticipants}
        />
      </div>
    </div>
  );
};

export default CartItem;
