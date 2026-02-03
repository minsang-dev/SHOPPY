import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingList, updateShoppingItem, deleteShoppingItem, addShoppingItem } from '@/entities/shopping/api/shopping';
import { getAiChecklist, toggleAiChecklistItem, deleteAiChecklistItem } from '@/entities/shopping/api/aiChecklist';
import type { AiChecklistItem, AiChecklistCategory } from '@/entities/shopping/api/aiChecklist';
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
import { calcOnlineCartTotal } from '@/features/cart/calculate-online-total/model/calcOnlineCartTotal';
import CartTotalSummary from '@/features/cart/calculate-online-total/ui/CartTotalSummary';
import CartCheckoutButton from '@/features/cart/proceed-checkout/ui/CartCheckoutButton';
import { useAuthStore } from '@/entities/user/model/useAuthStore';
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
  purchase_type: 'online' | 'offline' | 'ai' | null;
  item_size: string | null;
  reason: string | null;
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
  itemSize: raw.item_size,
  reason: raw.reason,
});

const CartPanel: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  // 방 입장 시 기본으로 오프라인(AI 추천) 장바구니 표시
  const [cartType, setCartType] = useState<'online' | 'offline'>('offline');
  const [isManualInputModalOpen, setIsManualInputModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [aiChecklistItems, setAiChecklistItems] = useState<AiChecklistItem[]>([]);
  const [productMetaMap, setProductMetaMap] = useState<ProductMetaMap>({});
  const [, setLoading] = useState(false);

  // 온라인 상품 여부 판별 헬퍼
  const isOnlineItem = (item: ShoppingItem) => item.purchaseType === 'online';

  // AI 체크리스트 아이템을 ShoppingItem 형태로 변환 (표시용)
  const aiItemsAsShoppingItems: ShoppingItem[] = aiChecklistItems.map((ai) => ({
    shoppingItemId: -ai.checklistItemId, // 음수 ID로 구분
    roomId: Number(roomId) || 0,
    addedByUserId: null,
    productId: null,
    displayName: ai.name,
    quantity: 1,
    isChecked: ai.checked,
    purchaseType: 'ai' as const,
    itemSize: ai.itemSize,
    reason: ai.reason,
  }));

  // 데이터 로드
  const loadItems = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      // 일반 장바구니 & AI 체크리스트 동시 로드
      const [shoppingResponse, aiResponse] = await Promise.all([
        getShoppingList(roomId),
        getAiChecklist(roomId).catch(() => null), // AI 체크리스트 없으면 null
      ]);

      setShoppingItems(shoppingResponse.items);

      // AI 체크리스트: 모든 카테고리의 아이템을 평탄화
      if (aiResponse?.categories) {
        const allAiItems = aiResponse.categories.flatMap((cat: AiChecklistCategory) => cat.items);
        setAiChecklistItems(allAiItems);
      } else {
        setAiChecklistItems([]);
      }

      const onlineIds = shoppingResponse.items
        .filter((i) => isOnlineItem(i) && i.productId != null)
        .map((i) => i.productId as number);
      if (onlineIds.length > 0) {
        try {
          const { products } = await getProductList();
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
                if (prev.some((i) => i.shoppingItemId === newItem.shoppingItemId)) {
                  return prev;
                }
                return [...prev, newItem];
              });
              // 새 온라인 상품의 가격 정보 조회 → productMetaMap 갱신 (총액 실시간 반영)
              if (isOnlineItem(newItem) && newItem.productId != null) {
                void getProductList().then((result) => {
                  const found = result.products.find((p) => p.product_id === newItem.productId);
                  if (found) {
                    setProductMetaMap((prev) =>
                      prev[found.product_id]
                        ? prev
                        : { ...prev, [found.product_id]: { imageUrl: found.image_url, price: found.price } }
                    );
                  }
                });
              }
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

  // AI 아이템 여부 판별 헬퍼 (음수 ID로 구분)
  const isAIItemById = (shoppingItemId: number) => shoppingItemId < 0;

  // purchaseType에 따라 필터링
  // - online: purchaseType === 'online'
  // - offline: 일반 offline 아이템 + AI 추천 아이템 (AI 체크리스트 API에서 가져옴)
  const currentCartItems = (() => {
    if (cartType === 'online') {
      return shoppingItems.filter((item) => isOnlineItem(item));
    } else {
      // 오프라인 장바구니: offline, null 아이템만 (ai 타입 제외 - AI 체크리스트 API에서 별도 로드)
      const offlineItems = shoppingItems.filter(
        (item) => !isOnlineItem(item) && item.purchaseType !== 'ai'
      );
      // AI 아이템을 먼저 표시
      return [...aiItemsAsShoppingItems, ...offlineItems];
    }
  })();

  const isOnline = cartType === 'online';

  // 온라인 장바구니 총액 (shoppingItems·productMetaMap 변경 시 자동 재계산)
  const onlineCartTotal = isOnline ? calcOnlineCartTotal(currentCartItems, productMetaMap) : 0;

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

    // AI 아이템인 경우 (음수 ID)
    if (isAIItemById(item.shoppingItemId)) {
      const checklistItemId = -item.shoppingItemId; // 원래 ID로 복원
      // 로컬 상태 먼저 업데이트
      setAiChecklistItems((prev) =>
        prev.map((ai) =>
          ai.checklistItemId === checklistItemId ? { ...ai, checked: !ai.checked } : ai
        )
      );
      await toggleAiChecklistItem(roomId, checklistItemId, !item.isChecked);
    } else {
      // 일반 ShoppingItem
      await updateShoppingItem(roomId, item.shoppingItemId, {
        quantity: item.quantity,
        isChecked: !item.isChecked,
        productId: item.productId,
      });
      await loadItems();
    }
  };

  const handleRemoveItem = async (item: ShoppingItem) => {
    if (!roomId) return;

    // AI 아이템인 경우 (음수 ID)
    if (isAIItemById(item.shoppingItemId)) {
      const checklistItemId = -item.shoppingItemId; // 원래 ID로 복원
      // 로컬 상태 먼저 업데이트
      setAiChecklistItems((prev) =>
        prev.filter((ai) => ai.checklistItemId !== checklistItemId)
      );
      await deleteAiChecklistItem(roomId, checklistItemId);
    } else {
      // 일반 ShoppingItem
      await deleteShoppingItem(roomId, item.shoppingItemId);
      await loadItems();
    }
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
              onQuantityDecrease={() => handleUpdateQuantity(item, item.quantity - 1)}
              onQuantityIncrease={() => handleUpdateQuantity(item, item.quantity + 1)}
              onRemove={() => handleRemoveItem(item)}
              onToggleChecked={!isOnline ? () => handleToggleChecked(item) : undefined}
              onSearchClick={!isOnline ? () => handleSearchProduct(item.displayName) : undefined}
            />
          ))
        )}
      </div>

      {isOnline && currentCartItems.length > 0 && (
        <>
          <CartTotalSummary total={onlineCartTotal} />
          <CartCheckoutButton
            onClick={() => roomId && navigate(`/rooms/${roomId}/checkout`)}
            disabled={!isLoggedIn}
          />
          {!isLoggedIn && (
            <p className="cart-checkout-hint">로그인 후 이용 가능합니다</p>
          )}
        </>
      )}

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
