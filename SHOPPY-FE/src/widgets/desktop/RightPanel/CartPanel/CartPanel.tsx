import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getShoppingList, updateShoppingItem, deleteShoppingItem, addShoppingItem } from '@/entities/shopping/api/shopping';
import type { ShoppingItem, ShoppingItemAddRequest } from '@/entities/shopping/types/shopping.types';
import CartTypeToggle from '../CartTypeToggle/CartTypeToggle';
import CartItem from '../CartItem/CartItem';
import OfflineCartInput from '@/features/cart/add-offline-item/ui/OfflineCartInput';
import ManualInputModal from '@/features/cart/add-offline-item/ui/ManualInputModal';
import './CartPanel.css';


const CartPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [cartType, setCartType] = useState<'online' | 'offline'>('online');
  const [expandedParticipants, setExpandedParticipants] = useState<Record<number, boolean>>({});
  const [isManualInputModalOpen, setIsManualInputModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // UI 전용 상태 (likes, dislikes, participants)
  const [itemLikes, setItemLikes] = useState<Record<number, number>>({});
  const [itemDislikes, setItemDislikes] = useState<Record<number, number>>({});
  const [itemParticipants] = useState<Record<number, string[]>>({});

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [, setLoading] = useState(false);

  // 데이터 로드
  const loadItems = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const response = await getShoppingList(roomId);
      setShoppingItems(response.items);
    } catch (error) {
      console.error('장바구니 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // purchase_type에 따라 필터링
  const currentCartItems = shoppingItems.filter((item) => {
    if (cartType === 'online') {
      return item.purchase_type === 'online';
    } else {
      return item.purchase_type === 'offline';
    }
  });

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

  const handleAddOfflineItem = async (productName: string, quantity: number) => {
    if (!roomId) return;
    
    // entities/shopping의 API 사용
    const payload: ShoppingItemAddRequest = {
      userId: 0, // TODO: 실제 userId 가져오기
      productId: null,
      displayName: productName,
      quantity,
      purchaseType: false, // 오프라인
    };
    await addShoppingItem(roomId, payload);
    await loadItems();
  };

  const handleUpdateQuantity = async (item: ShoppingItem, newQuantity: number) => {
    if (newQuantity < 1 || !roomId) return;
    await updateShoppingItem(roomId, item.shopping_item_id, { quantity: newQuantity });
    await loadItems();
  };

  const handleToggleChecked = async (item: ShoppingItem) => {
    if (!roomId) return;
    await updateShoppingItem(roomId, item.shopping_item_id, { isChecked: !item.is_checked });
    await loadItems();
  };

  const handleRemoveItem = async (item: ShoppingItem) => {
    if (!roomId) return;
    await deleteShoppingItem(roomId, item.shopping_item_id);
    await loadItems();
  };

  const handleToggleLike = (item: ShoppingItem) => {
    setItemLikes((prev) => ({
      ...prev,
      [item.shopping_item_id]: (prev[item.shopping_item_id] || 0) + 1,
    }));
  };

  const handleToggleDislike = (item: ShoppingItem) => {
    setItemDislikes((prev) => ({
      ...prev,
      [item.shopping_item_id]: (prev[item.shopping_item_id] || 0) + 1,
    }));
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
              key={item.shopping_item_id}
              item={item}
              cartType={cartType}
              isExpanded={expandedParticipants[item.shopping_item_id] || false}
              onQuantityDecrease={() => handleUpdateQuantity(item, item.quantity - 1)}
              onQuantityIncrease={() => handleUpdateQuantity(item, item.quantity + 1)}
              onRemove={() => handleRemoveItem(item)}
              onLike={() => handleToggleLike(item)}
              onDislike={() => handleToggleDislike(item)}
              onToggleParticipants={() => handleToggleParticipants(item.shopping_item_id)}
              onToggleChecked={!isOnline ? () => handleToggleChecked(item) : undefined}
              likes={itemLikes[item.shopping_item_id] || 0}
              dislikes={itemDislikes[item.shopping_item_id] || 0}
              participants={itemParticipants[item.shopping_item_id] || []}
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
