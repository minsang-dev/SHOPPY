import { useCallback, useEffect, useState } from 'react';
import {
  addShoppingItem,
  deleteShoppingItem,
  getShoppingList,
  updateShoppingItem,
} from '@/entities/shopping/api/shopping';
import type { ShoppingItem, ShoppingItemAddRequest } from '@/entities/shopping/types/shopping.types';

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
