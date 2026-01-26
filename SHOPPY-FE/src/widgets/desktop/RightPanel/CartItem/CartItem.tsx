import React from 'react';
import type { CartItem as CartItemType } from '../../../../entities/cart/types/cart.types';
import CartItemVotes from '../CartItemVotes/CartItemVotes';
import CartItemParticipants from '../CartItemParticipants/CartItemParticipants';
import './CartItem.css';

interface CartItemProps {
  item: CartItemType;
  cartType: 'online' | 'offline';
  isExpanded: boolean;
  onQuantityDecrease: () => void;
  onQuantityIncrease: () => void;
  onRemove: () => void;
  onLike: () => void;
  onDislike: () => void;
  onToggleParticipants: () => void;
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
}) => {
  const quantity = item.quantity || 1;
  const isOnline = cartType === 'online';

  return (
    <div className="cart-item">
      {/* 상품 이미지와 정보 */}
      <div className="cart-item-content">
        {isOnline && (
          <div className="cart-item-image">
            <img src={item.image_url} alt={item.name} />
          </div>
        )}
        <div className="cart-item-info">
          <h4 className="cart-item-name">{item.name}</h4>
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
          likes={item.likes || 0}
          dislikes={item.dislikes || 0}
          onLike={onLike}
          onDislike={onDislike}
        />
        <CartItemParticipants
          productId={item.product_id}
          participantCount={item.participants?.length || 0}
          isExpanded={isExpanded}
          onToggle={onToggleParticipants}
        />
      </div>
    </div>
  );
};

export default CartItem;
