export interface ShoppingItem {
  shoppingItemId: number;
  roomId: number;
  addedByUserId: number | null;
  productId: number | null;
  displayName: string;
  quantity: number;
  isChecked: boolean;
  purchaseType: string | null;
}

export interface ShoppingListResponse {
  items: ShoppingItem[];
}

export interface ShoppingItemAddRequest {
  userId: number;
  productId: number | null;
  displayName: string;
  quantity: number;
  purchaseType: boolean | null;
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
