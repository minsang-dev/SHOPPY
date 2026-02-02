import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingList, updateShoppingItem, deleteShoppingItem, addShoppingItem } from '@/entities/shopping/api/shopping';
import type { ShoppingItem, ShoppingItemAddRequest } from '@/entities/shopping/types/shopping.types';
import { getProductList } from '@/entities/product/api/productListApi';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicShoppingAdded,
  topicShoppingUpdated,
  topicShoppingDeleted,
} from '@/shared/lib/realtime';
import { realtimeConfig } from '@/shared/config/realtime';
import CartTypeToggle from '../CartTypeToggle/CartTypeToggle';
import CartItem from '../CartItem/CartItem';
import OfflineCartInput from '@/features/cart/add-offline-item/ui/OfflineCartInput';
import ManualInputModal from '@/features/cart/add-offline-item/ui/ManualInputModal';
import './CartPanel.css';

export type ProductMetaMap = Record<number, { imageUrl: string; price: number }>;

// 백엔드 웹소켓 응답 타입 (snake_case)
interface ShoppingItemRaw {
  shopping_item_id: number;
  room_id: number;
  added_by_user_id: number | null;
  product_id: number | null;
  display_name: string;
  quantity: number;
  is_checked: boolean;
  purchase_type: 'online' | 'offline' | null;
}

// snake_case → camelCase 변환
const toShoppingItem = (raw: ShoppingItemRaw): ShoppingItem => ({
  shoppingItemId: raw.shopping_item_id,
  roomId: raw.room_id,
  addedByUserId: raw.added_by_user_id,
  productId: raw.product_id,
  displayName: raw.display_name,
  quantity: raw.quantity,
  isChecked: raw.is_checked,
  purchaseType: raw.purchase_type,
});

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

  // 웹소켓 연결 및 구독
  const realtimeClientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);

  useEffect(() => {
    // 웹소켓 설정이 비활성화되어 있거나 roomId가 없으면 스킵
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }

    const token =
      sessionStorage.getItem('accessToken') ??
      sessionStorage.getItem('access_token') ??
      undefined;
    if (!token) {
      return;
    }

    const client = createRealtimeClient({ token });
    realtimeClientRef.current = client;
    let cancelled = false;
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;

        // 1) 아이템 추가 이벤트 구독
        subscriptions.push(
          subscribeTopic(client, topicShoppingAdded(roomId), (body) => {
            try {
              const raw = JSON.parse(body) as ShoppingItemRaw;
              const newItem = toShoppingItem(raw);
              setShoppingItems((prev) => {
                // 중복 방지
                if (prev.some((i) => i.shoppingItemId === newItem.shoppingItemId)) {
                  return prev;
                }
                return [...prev, newItem];
              });
            } catch (err) {
              console.error('장바구니 추가 이벤트 파싱 실패:', err);
            }
          })
        );

        // 2) 아이템 수정 이벤트 구독
        subscriptions.push(
          subscribeTopic(client, topicShoppingUpdated(roomId), (body) => {
            try {
              const raw = JSON.parse(body) as ShoppingItemRaw;
              const updated = toShoppingItem(raw);
              setShoppingItems((prev) =>
                prev.map((item) =>
                  item.shoppingItemId === updated.shoppingItemId ? updated : item
                )
              );
            } catch (err) {
              console.error('장바구니 수정 이벤트 파싱 실패:', err);
            }
          })
        );

        // 3) 아이템 삭제 이벤트 구독
        subscriptions.push(
          subscribeTopic(client, topicShoppingDeleted(roomId), (body) => {
            try {
              const { shopping_item_id } = JSON.parse(body) as { shopping_item_id: number };
              setShoppingItems((prev) =>
                prev.filter((item) => item.shoppingItemId !== shopping_item_id)
              );
            } catch (err) {
              console.error('장바구니 삭제 이벤트 파싱 실패:', err);
            }
          })
        );
      })
      .catch((err) => {
        console.error('장바구니 WebSocket 연결 실패:', err);
      });

    // cleanup: 컴포넌트 언마운트 시 구독 해제 및 연결 종료
    return () => {
      cancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe());
      void disconnectRealtimeClient(client);
      if (realtimeClientRef.current === client) {
        realtimeClientRef.current = null;
      }
    };
  }, [roomId]);

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
