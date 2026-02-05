import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addShoppingItem,
  deleteShoppingItem,
  getShoppingList,
  updateShoppingItem,
} from '@/entities/shopping/api/shopping';
import {
  deleteAiChecklistItem,
  getAiChecklist,
  toggleAiChecklistItem,
} from '@/entities/shopping/api/aiChecklist';
import type { AiChecklistCategory, AiChecklistItem } from '@/entities/shopping/api/aiChecklist';
import type { ShoppingItem, ShoppingItemAddRequest } from '@/entities/shopping/types/shopping.types';
import {
  connectRealtimeClient,
  createRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicAiChecklistDeleted,
  topicAiChecklistToggled,
  topicShoppingAdded,
  topicShoppingDeleted,
  topicShoppingUpdated,
} from '@/shared/lib/realtime';
import { realtimeConfig } from '@/shared/config/realtime';

export interface UiCartItem {
  id: number;
  name: string;
  quantity: number;
  checked: boolean;
  purchaseType: 'online' | 'offline' | 'ai' | null;
  isAiItem?: boolean;
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

type ShoppingItemRealtimeRaw = {
  shopping_item_id?: number;
  shoppingItemId?: number;
  display_name?: string;
  displayName?: string;
  quantity?: number;
  is_checked?: boolean;
  isChecked?: boolean;
  purchase_type?: 'online' | 'offline' | 'ai' | null;
  purchaseType?: 'online' | 'offline' | 'ai' | null;
};

type ShoppingItemDeleteRealtimeRaw = {
  shopping_item_id?: number;
  shoppingItemId?: number;
};

type AiChecklistRealtimeRaw = {
  checklist_item_id?: number;
  checklistItemId?: number;
  checked?: boolean;
};

const toUiItems = (items: ShoppingItem[]): UiCartItem[] =>
  items.map((item) => ({
    id: item.shoppingItemId,
    name: item.displayName,
    quantity: item.quantity ?? 0,
    checked: Boolean(item.isChecked),
    purchaseType: item.purchaseType,
  }));

const toAiUiItems = (categories?: AiChecklistCategory[]): UiCartItem[] => {
  if (!categories) return [];
  return categories.flatMap((category: AiChecklistCategory) =>
    category.items.map((aiItem: AiChecklistItem) => ({
      id: -aiItem.checklistItemId,
      name: aiItem.name,
      quantity: 1,
      checked: aiItem.checked,
      purchaseType: 'ai' as const,
      isAiItem: true,
    }))
  );
};

const parseShoppingItem = (raw: ShoppingItemRealtimeRaw): UiCartItem | null => {
  const id = raw.shopping_item_id ?? raw.shoppingItemId;
  if (typeof id !== 'number') return null;

  return {
    id,
    name: raw.display_name ?? raw.displayName ?? '',
    quantity: raw.quantity ?? 0,
    checked: Boolean(raw.is_checked ?? raw.isChecked),
    purchaseType: raw.purchase_type ?? raw.purchaseType ?? null,
  };
};

const parseShoppingItemDeleteId = (raw: ShoppingItemDeleteRealtimeRaw): number | null => {
  const id = raw.shopping_item_id ?? raw.shoppingItemId;
  return typeof id === 'number' ? id : null;
};

const parseAiChecklistItemId = (raw: AiChecklistRealtimeRaw): number | null => {
  const id = raw.checklist_item_id ?? raw.checklistItemId;
  return typeof id === 'number' ? id : null;
};

const mergeItems = (shoppingItems: ShoppingItem[], aiCategories?: AiChecklistCategory[]) => {
  return [...toAiUiItems(aiCategories), ...toUiItems(shoppingItems)];
};

export const useShoppingItems = (roomId?: string): UseShoppingItemsState => {
  const [items, setItems] = useState<UiCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const realtimeClientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);

  const reload = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const [shoppingData, aiData] = await Promise.all([
        getShoppingList(roomId),
        getAiChecklist(roomId).catch(() => null),
      ]);

      setItems(mergeItems(shoppingData.items, aiData?.categories));
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

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) return;

    const token = sessionStorage.getItem('accessToken') ?? sessionStorage.getItem('access_token') ?? undefined;
    if (!token) return;

    const client = createRealtimeClient({ token });
    realtimeClientRef.current = client;
    let cancelled = false;
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;

        subscriptions.push(
          subscribeTopic(client, topicShoppingAdded(roomId), (body) => {
            try {
              const parsed = parseShoppingItem(JSON.parse(body) as ShoppingItemRealtimeRaw);
              if (!parsed) return;
              setItems((prev) => {
                if (prev.some((item) => item.id === parsed.id)) return prev;
                return [...prev, parsed];
              });
            } catch (err) {
              console.error('shopping added parse failed:', err);
            }
          })
        );

        subscriptions.push(
          subscribeTopic(client, topicShoppingUpdated(roomId), (body) => {
            try {
              const parsed = parseShoppingItem(JSON.parse(body) as ShoppingItemRealtimeRaw);
              if (!parsed) return;
              setItems((prev) => prev.map((item) => (item.id === parsed.id ? parsed : item)));
            } catch (err) {
              console.error('shopping updated parse failed:', err);
            }
          })
        );

        subscriptions.push(
          subscribeTopic(client, topicShoppingDeleted(roomId), (body) => {
            try {
              const id = parseShoppingItemDeleteId(JSON.parse(body) as ShoppingItemDeleteRealtimeRaw);
              if (id == null) return;
              setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
              console.error('shopping deleted parse failed:', err);
            }
          })
        );

        subscriptions.push(
          subscribeTopic(client, topicAiChecklistToggled(roomId), (body) => {
            try {
              const parsed = JSON.parse(body) as AiChecklistRealtimeRaw;
              const checklistItemId = parseAiChecklistItemId(parsed);
              if (checklistItemId == null || typeof parsed.checked !== 'boolean') return;
              const aiItemId = -checklistItemId;
              setItems((prev) =>
                prev.map((item) => (item.id === aiItemId ? { ...item, checked: parsed.checked as boolean } : item))
              );
            } catch (err) {
              console.error('ai checklist toggled parse failed:', err);
            }
          })
        );

        subscriptions.push(
          subscribeTopic(client, topicAiChecklistDeleted(roomId), (body) => {
            try {
              const parsed = JSON.parse(body) as AiChecklistRealtimeRaw;
              const checklistItemId = parseAiChecklistItemId(parsed);
              if (checklistItemId == null) return;
              const aiItemId = -checklistItemId;
              setItems((prev) => prev.filter((item) => item.id !== aiItemId));
            } catch (err) {
              console.error('ai checklist deleted parse failed:', err);
            }
          })
        );
      })
      .catch((err) => {
        console.error('shopping realtime connect failed:', err);
      });

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
      if (!roomId) return;

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
    [reload, roomId]
  );

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      if (!roomId) return;

      try {
        await updateShoppingItem(roomId, id, { quantity });
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
      } catch (err) {
        console.error('Failed to update quantity:', err);
        setError('Failed to update quantity.');
      }
    },
    [roomId]
  );

  const toggleChecked = useCallback(
    async (id: number, checked: boolean) => {
      if (!roomId) return;

      try {
        if (id < 0) {
          await toggleAiChecklistItem(roomId, -id, checked);
        } else {
          await updateShoppingItem(roomId, id, { isChecked: checked });
        }

        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)));
      } catch (err) {
        console.error('Failed to update checked state:', err);
        setError('Failed to update checked state.');
      }
    },
    [roomId]
  );

  const removeItem = useCallback(
    async (id: number) => {
      if (!roomId) return;

      try {
        if (id < 0) {
          await deleteAiChecklistItem(roomId, -id);
        } else {
          await deleteShoppingItem(roomId, id);
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
        setError('Failed to delete item.');
      }
    },
    [roomId]
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
