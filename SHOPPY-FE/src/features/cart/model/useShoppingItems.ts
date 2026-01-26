import { useEffect, useState } from 'react';
import { normalizeApiError } from '../../../shared/api/error';
import {
  addShoppingItem,
  deleteShoppingItem,
  getShoppingItems,
  updateShoppingItem,
} from '../../../shared/api/cart';
import type { ShoppingItem } from '../../../shared/api/types';

export const useShoppingItems = (roomId: number | string | null) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeApiError> | null>(null);

  const fetchItems = async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getShoppingItems(roomId);
      setItems(res.items);
    } catch (e) {
      setError(normalizeApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (payload: {
    name: string;
    quantity: number;
    price?: number;
    imageUrl?: string | null;
  }) => {
    if (!roomId) return;
    await addShoppingItem(roomId, payload);
    await fetchItems();
  };

  const updateItem = async (shoppingItemId: number, payload: Partial<ShoppingItem>) => {
    if (!roomId) return;
    await updateShoppingItem(roomId, shoppingItemId, payload);
    await fetchItems();
  };

  const removeItem = async (shoppingItemId: number) => {
    if (!roomId) return;
    await deleteShoppingItem(roomId, shoppingItemId);
    await fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, [roomId]);

  return { items, loading, error, fetchItems, addItem, updateItem, removeItem };
};
