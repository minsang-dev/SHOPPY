import React, { useState } from 'react';
import type { ShoppingItem } from '@/entities/shopping/types/shopping.types';
import './CartItem.css';

export interface ProductMeta {
  imageUrl: string;
  price: number;
}

interface CartItemProps {
  item: ShoppingItem;
  cartType: 'online' | 'offline';
  productMeta?: ProductMeta; // 온라인 상품: 이미지·가격 (productId로 조회)
  onQuantityDecrease: () => void;
  onQuantityIncrease: () => void;
  onRemove: () => void;
  onToggleChecked?: () => void; // 오프라인 장바구니 체크박스
  onSearchClick?: () => void; // 오프라인 장바구니 검색(돋보기) 버튼
}


const CartItem: React.FC<CartItemProps> = ({
  item,
  cartType,
  productMeta,
  onQuantityDecrease,
  onQuantityIncrease,
  onRemove,
  onToggleChecked,
  onSearchClick,
}) => {
  const quantity = item.quantity;
  const isOnline = cartType === 'online';
  const isChecked = item.isChecked;
  const [imageError, setImageError] = useState(false);

  const showImage = productMeta?.imageUrl && !imageError;

  return (
    <div className="cart-item">
      {/* 상품 이미지 / 상품명 / 가격 / 수량 / 삭제 */}
      <div className="cart-item-content">
        {isOnline && item.productId != null && (
          <div className="cart-item-image">
            {showImage ? (
              <img
                src={productMeta!.imageUrl}
                alt={item.displayName}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="cart-item-image-placeholder">이미지</div>
            )}
          </div>
        )}
        <div className="cart-item-info">
          <div className="cart-item-name-wrapper">
            {!isOnline && onToggleChecked && (
              <input
                type="checkbox"
                className="cart-item-checkbox"
                checked={isChecked}
                onChange={onToggleChecked}
                aria-label={`${item.displayName} 체크`}
              />
            )}
            <div className="cart-item-name-section">
              <h4 className="cart-item-name">{item.displayName}</h4>
              {isOnline && !!item.addedByUserId && (
                <p className="cart-item-added-by">
                  {item.addedByUserId}님이 추가한 상품
                </p>
              )}
              {isOnline && productMeta != null && (
                <p className="cart-item-price">
                  {productMeta.price.toLocaleString()}원
                </p>
              )}
            </div>
            {!isOnline && (
              <>
                <span className="cart-item-search-btn-wrap">
                  <button
                    className="cart-item-icon-btn search-btn"
                    onClick={onSearchClick}
                    aria-label="실물 상품 검색하기"
                  >
                    <i className="ri-search-line"></i>
                  </button>
                  <span className="cart-item-tooltip" aria-hidden="true">
                    실물 상품 검색하기
                  </span>
                </span>
                <button
                  className="cart-item-icon-btn remove-btn"
                  onClick={onRemove}
                  aria-label="삭제"
                >
                  <i className="ri-delete-bin-6-line"></i>
                </button>
              </>
            )}
          </div>

          {isOnline && (
            <div className="cart-item-controls">
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
              <button
                className="remove-btn"
                onClick={onRemove}
                aria-label="삭제"
              >
                <i className="ri-delete-bin-6-line"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
