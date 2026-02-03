import { apiGet, apiPost, apiPatch, apiDelete } from '@/shared/api/utils';
import type {
  ShoppingItem,
  ShoppingItemAddRequest,
  ShoppingItemDeleteResponse,
  ShoppingItemUpdateRequest,
  ShoppingItemUpdateResponse,
  ShoppingListResponse,
} from '../types/shopping.types';

// ============================================================
// 백엔드 응답 타입 (snake_case)
// ============================================================
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

interface ShoppingItemUpdateResponseRaw {
  shopping_item_id: number;
  quantity: number;
  is_checked: boolean;
  product_id: number | null;
}

interface ShoppingItemDeleteResponseRaw {
  shopping_item_id: number;
}

// ============================================================
// 변환 함수: snake_case -> camelCase
// ============================================================
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

const toUpdateResponse = (raw: ShoppingItemUpdateResponseRaw): ShoppingItemUpdateResponse => ({
  shoppingItemId: raw.shopping_item_id,
  quantity: raw.quantity,
  isChecked: raw.is_checked,
  productId: raw.product_id,
});

const toDeleteResponse = (raw: ShoppingItemDeleteResponseRaw): ShoppingItemDeleteResponse => ({
  shoppingItemId: raw.shopping_item_id,
});

// ============================================================
// API 함수
// ============================================================

// 장바구니 목록 조회
export const getShoppingList = async (roomId: string): Promise<ShoppingListResponse> => {
  const res = await apiGet<{ items: ShoppingItemRaw[] }>(`/rooms/${roomId}/shopping-items`);
  return {
    items: res.items.map(toShoppingItem),
  };
};

// 장바구니 아이템 추가 (AddRequest는 백엔드가 camelCase로 받음)
export const addShoppingItem = (
  roomId: string,
  payload: ShoppingItemAddRequest,
): Promise<void> => apiPost<void>(`/rooms/${roomId}/shopping-items`, payload);

// 장바구니 아이템 수정 (UpdateRequest는 백엔드가 snake_case로 받음)
export const updateShoppingItem = async (
  roomId: string,
  shoppingItemId: number,
  payload: ShoppingItemUpdateRequest,
): Promise<ShoppingItemUpdateResponse> => {
  // camelCase -> snake_case 변환 (quantity, is_checked, product_id 모두 포함하여 전송)
  const snakePayload: Record<string, unknown> = {};
  if (payload.quantity !== undefined) snakePayload.quantity = payload.quantity;
  if (payload.isChecked !== undefined) snakePayload.is_checked = payload.isChecked;
  if (payload.productId !== undefined) snakePayload.product_id = payload.productId;

  const res = await apiPatch<ShoppingItemUpdateResponseRaw>(
    `/rooms/${roomId}/shopping-items/${shoppingItemId}`,
    snakePayload,
  );
  return toUpdateResponse(res);
};

// 장바구니 아이템 삭제
export const deleteShoppingItem = async (
  roomId: string,
  shoppingItemId: number,
): Promise<ShoppingItemDeleteResponse> => {
  const res = await apiDelete<ShoppingItemDeleteResponseRaw>(
    `/rooms/${roomId}/shopping-items/${shoppingItemId}`,
  );
  return toDeleteResponse(res);
};
