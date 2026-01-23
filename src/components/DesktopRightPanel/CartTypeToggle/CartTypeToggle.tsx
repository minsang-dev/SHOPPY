import React from 'react';
import './CartTypeToggle.css';

interface CartTypeToggleProps {
  cartType: 'online' | 'offline';
  onCartTypeChange: (type: 'online' | 'offline') => void;
}

/**
 * 장바구니 타입 토글 컴포넌트
 * 온라인/오프라인 장바구니를 전환하는 버튼
 */
const CartTypeToggle: React.FC<CartTypeToggleProps> = ({ cartType, onCartTypeChange }) => {
  return (
    <div className="cart-type-toggle">
      <button
        className={`cart-type-btn ${cartType === 'online' ? 'active' : ''}`}
        onClick={() => onCartTypeChange('online')}
      >
        온라인 장바구니
      </button>
      <button
        className={`cart-type-btn ${cartType === 'offline' ? 'active' : ''}`}
        onClick={() => onCartTypeChange('offline')}
      >
        오프라인 장바구니
      </button>
    </div>
  );
};

export default CartTypeToggle;
