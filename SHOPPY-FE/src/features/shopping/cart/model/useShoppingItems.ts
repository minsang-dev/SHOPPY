import { useCallback, useEffect, useState, useRef } from 'react';
import {
  addShoppingItem,
  deleteShoppingItem,
  getShoppingList,
  updateShoppingItem,
} from '@/entities/shopping/api/shopping';
import type { ShoppingItem, ShoppingItemAddRequest } from '@/entities/shopping/types/shopping.types';
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

export interface UiCartItem {
  id: number;
  name: string;
  quantity: number;
  checked: boolean;
  purchaseType: 'online' | 'offline' | null;
}

interface UseShoppingItemsState {
  items: UiCartItem[];
  loading: boolean;
  error: string | null;
  addItem: (name: string, quantity: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  toggleChecked: (id: number, checked: boolean) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  reload: () => Promise<void>;
}

const toUiItems = (items: ShoppingItem[]): UiCartItem[] =>
  items.map((item) => ({
    id: item.shoppingItemId,
    name: item.displayName,
    quantity: item.quantity ?? 0,
    checked: Boolean(item.isChecked),
    purchaseType: item.purchaseType,
  }));

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

// snake_case → UiCartItem 변환
const rawToUiItem = (raw: ShoppingItemRaw): UiCartItem => ({
  id: raw.shopping_item_id,
  name: raw.display_name,
  quantity: raw.quantity ?? 0,
  checked: Boolean(raw.is_checked),
  purchaseType: raw.purchase_type,
});

export const useShoppingItems = (roomId?: string): UseShoppingItemsState => {
  const [items, setItems] = useState<UiCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!roomId) {
      return;
    }
    try {
      setLoading(true);
      const data = await getShoppingList(roomId);
      setItems(toUiItems(data.items));
      setError(null);
    } catch (err) {
      console.error('Failed to load shopping list:', err);
      setError('Failed to load shopping list.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 웹소켓 연결 및 구독
  const realtimeClientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);

  useEffect(() => {
    // 웹소켓 설정이 비활성화되어 있거나 roomId가 없으면 스킵
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }

    const token =
      localStorage.getItem('accessToken') ??
      localStorage.getItem('access_token') ??
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
              const newItem = rawToUiItem(raw);
              setItems((prev) => {
                // 중복 방지
                if (prev.some((i) => i.id === newItem.id)) {
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
              const updated = rawToUiItem(raw);
              setItems((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
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
              setItems((prev) => prev.filter((item) => item.id !== shopping_item_id));
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

  const addItem = useCallback(
    async (name: string, quantity: number) => {
      if (!roomId) {
        return;
      }
      try {
        setLoading(true);
        const payload: ShoppingItemAddRequest = {
          userId: 1,
          productId: null,
          displayName: name,
          quantity,
          purchaseType: false,
          expectedUnitPrice: null,
        };
        await addShoppingItem(roomId, payload);
        await reload();
      } catch (err) {
        console.error('Failed to add shopping item:', err);
        setError('Failed to add shopping item.');
      } finally {
        setLoading(false);
      }
    },
    [reload, roomId],
  );

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      if (!roomId) {
        return;
      }
      try {
        await updateShoppingItem(roomId, id, { quantity });
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
        );
      } catch (err) {
        console.error('Failed to update quantity:', err);
        setError('Failed to update quantity.');
      }
    },
    [roomId],
  );

  const toggleChecked = useCallback(
    async (id: number, checked: boolean) => {
      if (!roomId) {
        return;
      }
      try {
        await updateShoppingItem(roomId, id, { isChecked: checked });
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, checked } : item)),
        );
      } catch (err) {
        console.error('Failed to update checked state:', err);
        setError('Failed to update checked state.');
      }
    },
    [roomId],
  );

  const removeItem = useCallback(
    async (id: number) => {
      if (!roomId) {
        return;
      }
      try {
        await deleteShoppingItem(roomId, id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
        setError('Failed to delete item.');
      }
    },
    [roomId],
  );

  return {
    items,
    loading,
    error,
    addItem,
    updateQuantity,
    toggleChecked,
    removeItem,
    reload,
  };
};
