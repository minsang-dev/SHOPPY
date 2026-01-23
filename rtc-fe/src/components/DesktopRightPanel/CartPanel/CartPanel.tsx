import React, { useState } from 'react';
import { useCartStore } from '../../../stores/useCartStore';
import CartTypeToggle from '../CartTypeToggle/CartTypeToggle';
import CartItem from '../CartItem/CartItem';
import './CartPanel.css';

/**
 * 장바구니 패널 컴포넌트
 * 온라인/오프라인 장바구니를 관리하는 메인 패널
 */
const CartPanel: React.FC = () => {
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
  const isOnline = cartType === 'online';

  const handleToggleParticipants = (productId: number) => {
    setExpandedParticipants(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="panel-content cart-panel">
      <CartTypeToggle cartType={cartType} onCartTypeChange={setCartType} />

      <div className="cart-items-list">
        {currentCartItems.length === 0 ? (
          <div className="empty-cart">
            <p>장바구니가 비어있습니다.</p>
          </div>
        ) : (
          currentCartItems.map((item) => (
            <CartItem
              key={item.product_id}
              item={item}
              cartType={cartType}
              isExpanded={expandedParticipants[item.product_id] || false}
              onQuantityDecrease={() => updateQuantity(item.product_id, (item.quantity || 1) - 1, isOnline)}
              onQuantityIncrease={() => updateQuantity(item.product_id, (item.quantity || 1) + 1, isOnline)}
              onRemove={() => removeFromCart(item.product_id, isOnline)}
              onLike={() => toggleLike(item.product_id)}
              onDislike={() => toggleDislike(item.product_id)}
              onToggleParticipants={() => handleToggleParticipants(item.product_id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CartPanel;
