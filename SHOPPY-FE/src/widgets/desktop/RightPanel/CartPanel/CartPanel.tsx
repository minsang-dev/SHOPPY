import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingList, updateShoppingItem, deleteShoppingItem, addShoppingItem } from '@/entities/shopping/api/shopping';
import type { ShoppingItem, ShoppingItemAddRequest } from '@/entities/shopping/types/shopping.types';
import { getProductList } from '@/entities/product/api/productListApi';
import CartTypeToggle from '../CartTypeToggle/CartTypeToggle';
import CartItem from '../CartItem/CartItem';
import OfflineCartInput from '@/features/cart/add-offline-item/ui/OfflineCartInput';
import ManualInputModal from '@/features/cart/add-offline-item/ui/ManualInputModal';
import './CartPanel.css';

export type ProductMetaMap = Record<number, { imageUrl: string; price: number }>;


const CartPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [cartType, setCartType] = useState<'online' | 'offline'>('online');
  const [expandedParticipants, setExpandedParticipants] = useState<Record<number, boolean>>({});
  const [isManualInputModalOpen, setIsManualInputModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // UI 전용 상태 (participants)
  const [itemParticipants] = useState<Record<number, string[]>>({});

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [productMetaMap, setProductMetaMap] = useState<ProductMetaMap>({});
  const [, setLoading] = useState(false);

  // 온라인 상품 여부 판별 헬퍼
  const isOnlineItem = (item: ShoppingItem) => item.purchaseType === 'online';

  // 데이터 로드
  const loadItems = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const response = await getShoppingList(roomId);
      setShoppingItems(response.items);
      const onlineIds = response.items
        .filter((i) => isOnlineItem(i) && i.productId != null)
        .map((i) => i.productId as number);
      if (onlineIds.length > 0) {
        try {
          const products = await getProductList();
          const map: ProductMetaMap = {};
          products.forEach((p) => {
            map[p.product_id] = { imageUrl: p.image_url, price: p.price };
          });
          setProductMetaMap(map);
        } catch {
          setProductMetaMap({});
        }
      } else {
        setProductMetaMap({});
      }
    } catch (error) {
      console.error('장바구니 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // 장바구니 갱신 이벤트 리스닝
  useEffect(() => {
    const handleCartUpdate = () => {
      loadItems();
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [loadItems]);

  // purchaseType에 따라 필터링 (null도 offline으로 처리)
  const currentCartItems = shoppingItems.filter((item) => {
    if (cartType === 'online') {
      return isOnlineItem(item);
    } else {
      return !isOnlineItem(item);
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

  const handleAddOfflineItem = async (productName: string) => {
    if (!roomId) return;

    const payload: ShoppingItemAddRequest = {
      userId: 0, // TODO: 실제 userId 가져오기
      productId: null,
      displayName: productName,
      quantity: 1,
      purchaseType: false, // 오프라인 = 0
    };
    await addShoppingItem(roomId, payload);
    await loadItems();
  };

  const handleUpdateQuantity = async (item: ShoppingItem, newQuantity: number) => {
    if (newQuantity < 1 || !roomId) return;
    // 로컬 상태 먼저 업데이트 (이미지 유지)
    setShoppingItems((prev) =>
      prev.map((i) =>
        i.shoppingItemId === item.shoppingItemId ? { ...i, quantity: newQuantity } : i
      )
    );
    // 서버에 반영 (productId 유지 필수)
    await updateShoppingItem(roomId, item.shoppingItemId, {
      quantity: newQuantity,
      productId: item.productId,
    });
  };

  const handleToggleChecked = async (item: ShoppingItem) => {
    if (!roomId) return;
    await updateShoppingItem(roomId, item.shoppingItemId, {
      quantity: item.quantity,
      isChecked: !item.isChecked,
      productId: item.productId,
    });
    await loadItems();
  };

  const handleRemoveItem = async (item: ShoppingItem) => {
    if (!roomId) return;
    await deleteShoppingItem(roomId, item.shoppingItemId);
    await loadItems();
  };

  /** 오프라인 상품명으로 왼쪽 상품 목록에서 검색 (products 페이지로 이동 + keyword 쿼리) */
  const handleSearchProduct = (productName: string) => {
    if (!roomId) return;
    const keyword = encodeURIComponent(productName.trim());
    navigate(`/rooms/${roomId}/products${keyword ? `?keyword=${keyword}` : ''}`);
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
              key={item.shoppingItemId}
              item={item}
              cartType={cartType}
              productMeta={isOnline && item.productId != null ? productMetaMap[item.productId] : undefined}
              isExpanded={expandedParticipants[item.shoppingItemId] || false}
              onQuantityDecrease={() => handleUpdateQuantity(item, item.quantity - 1)}
              onQuantityIncrease={() => handleUpdateQuantity(item, item.quantity + 1)}
              onRemove={() => handleRemoveItem(item)}
              onToggleParticipants={() => handleToggleParticipants(item.shoppingItemId)}
              onToggleChecked={!isOnline ? () => handleToggleChecked(item) : undefined}
              onSearchClick={!isOnline ? () => handleSearchProduct(item.displayName) : undefined}
              participants={itemParticipants[item.shoppingItemId] || []}
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
