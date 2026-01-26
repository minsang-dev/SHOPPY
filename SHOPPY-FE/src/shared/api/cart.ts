import { apiDelete, apiGet, apiPatch, apiPost } from './utils';
import type { ShoppingItem } from './types';

type RoomId = string | number;

export const getShoppingItems = (roomId: RoomId) =>
  apiGet<{ items: ShoppingItem[] }>(`/rooms/${roomId}/shopping-items`);

export const addShoppingItem = (
  roomId: RoomId,
  payload: {
    userId: number | null;
    productId: number | null;
    displayName: string;
    quantity: number;
    purchaseType: boolean | null;
    expectedUnitPrice?: string | null;
  },
) => apiPost<void>(`/rooms/${roomId}/shopping-items`, payload);

export const updateShoppingItem = (
  roomId: RoomId,
  shoppingItemId: number,
  payload: Partial<Omit<ShoppingItem, 'shoppingItemId'>>,
) => apiPatch<ShoppingItem>(`/rooms/${roomId}/shopping-items/${shoppingItemId}`, payload);

export const deleteShoppingItem = (roomId: RoomId, shoppingItemId: number) =>
  apiDelete<void>(`/rooms/${roomId}/shopping-items/${shoppingItemId}`);
