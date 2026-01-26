import { useCallback, useEffect, useState } from 'react';
import {
  addShoppingItem,
  deleteShoppingItem,
  getShoppingItems,
  updateShoppingItem,
} from '../../../../shared/api/cart';
import type { ShoppingItem } from '../../../../shared/api/types';

export interface UiCartItem {
  id: number;
  name: string;
  quantity: number;
  checked: boolean;
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
    name: item.name,
    quantity: item.quantity,
    checked: Boolean(item.checked),
  }));

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
      const data = await getShoppingItems(roomId);
      setItems(toUiItems(data.items));
      setError(null);
    } catch (err) {
      console.error('Failed to load shopping list:', err);
      setError('장바구니를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addItem = useCallback(
    async (name: string, quantity: number) => {
      if (!roomId) {
        return;
      }
      try {
        setLoading(true);
        await addShoppingItem(roomId, {
          name,
          quantity,
        });
        await reload();
      } catch (err) {
        console.error('Failed to add shopping item:', err);
        setError('상품 추가에 실패했습니다.');
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
        setLoading(true);
        await updateShoppingItem(roomId, id, { quantity });
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
        );
      } catch (err) {
        console.error('Failed to update quantity:', err);
        setError('상품 수정에 실패했습니다.');
      } finally {
        setLoading(false);
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
        setLoading(true);
        await updateShoppingItem(roomId, id, { checked });
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, checked } : item)),
        );
      } catch (err) {
        console.error('Failed to update checked state:', err);
        setError('상품 수정에 실패했습니다.');
      } finally {
        setLoading(false);
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
        setLoading(true);
        await deleteShoppingItem(roomId, id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to delete item:', err);
        setError('상품 삭제에 실패했습니다.');
      } finally {
        setLoading(false);
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
