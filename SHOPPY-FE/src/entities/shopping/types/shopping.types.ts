export interface ShoppingItem {
  shoppingItemId: number;
  roomId: number;
  addedByUserId: number | null;
  productId: number | null;
  displayName: string;
  quantity: number;
  isChecked: boolean;
  purchaseType: 'online' | 'offline' | 'ai' | null;
  itemSize: string | null; // AI 추천 상품 사이즈
  reason: string | null; // AI 추천 이유
}

export interface ShoppingListResponse {
  items: ShoppingItem[];
}

export interface ShoppingItemAddRequest {
  userId: number;
  productId: number | null;
  displayName: string;
  quantity: number;
  purchaseType: boolean; // true=온라인(1), false=오프라인(0)
  expectedUnitPrice?: string | null;
}

export interface ShoppingItemUpdateRequest {
  quantity?: number;
  isChecked?: boolean;
  productId?: number | null;
}

export interface ShoppingItemUpdateResponse {
  shoppingItemId: number;
  quantity: number;
  isChecked: boolean;
  productId: number | null;
}

export interface ShoppingItemDeleteResponse {
  shoppingItemId: number;
}
