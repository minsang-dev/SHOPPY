import React, { useState } from 'react';
import { useCartStore } from '../../../../entities/cart/model/useCartStore';
import CartTypeToggle from '../CartTypeToggle/CartTypeToggle';
import CartItem from '../CartItem/CartItem';
import OfflineCartInput from '../../../../features/cart/add-offline-item/ui/OfflineCartInput';
import ManualInputModal from '../../../../features/cart/add-offline-item/ui/ManualInputModal';
import type { CartItem as CartItemType } from '../../../../entities/cart/types/cart.types';
import './CartPanel.css';


const CartPanel: React.FC = () => {
  const [cartType, setCartType] = useState<'online' | 'offline'>('online');
  const [expandedParticipants, setExpandedParticipants] = useState<Record<number, boolean>>({});
  const [isManualInputModalOpen, setIsManualInputModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const {
    onlineCartItems,
    offlineCartItems,
    updateQuantity,
    removeFromCart,
    toggleLike,
    toggleDislike,
    addToOfflineCart,
  } = useCartStore();

  const currentCartItems = cartType === 'online' ? onlineCartItems : offlineCartItems;
  const isOnline = cartType === 'online';

  const handleToggleParticipants = (productId: number) => {
    setExpandedParticipants(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleVoiceInput = () => {
    // TODO: Web Speech API 연결
    // 현재는 UI만 토글
    setIsListening((prev) => !prev);
    
    // 테스트용: 3초 후 자동으로 끄기 (실제 API 연결 시 제거)
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    }
  };

  const handleManualInput = () => {
    setIsManualInputModalOpen(true);
  };

  const handleAddOfflineItem = (productName: string, quantity: number) => {
    // 오프라인 장바구니 아이템 생성
    // product_id는 고유한 값으로 생성 (음수로 구분하여 온라인과 구분)
    const offlineProductId = -Date.now();
    
    const offlineItem: CartItemType = {
      product_id: offlineProductId,
      name: productName,
      price: 0, // 오프라인은 가격 미정이므로 0으로 설정
      image_url: '', // 기본 이미지 없음
      quantity: quantity,
      likes: 0,
      dislikes: 0,
      participants: [],
    };

    addToOfflineCart(offlineItem);
  };

  return (
    <div className="panel-content cart-panel">
      <CartTypeToggle cartType={cartType} onCartTypeChange={setCartType} />

      {/* 오프라인 장바구니일 때만 입력 버튼 표시 */}
      {!isOnline && (
        <OfflineCartInput
          isListening={isListening}
          onVoiceInput={handleVoiceInput}
          onManualInput={handleManualInput}
        />
      )}

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

      {/* 수동입력 모달 */}
      <ManualInputModal
        isOpen={isManualInputModalOpen}
        onClose={() => setIsManualInputModalOpen(false)}
        onAdd={handleAddOfflineItem}
      />
    </div>
  );
};

export default CartPanel;
