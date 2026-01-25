export interface ShoppingItem {
  shopping_item_id: number;
  room_id: number;
  added_by_user_id: number | null;
  product_id: number | null;
  display_name: string;
  quantity: number;
  is_checked: boolean;
  purchase_type: string | null;
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
  is_checked?: boolean;
  product_id?: number | null;
}

export interface ShoppingItemUpdateResponse {
  shopping_item_id: number;
  quantity: number;
  is_checked: boolean;
  product_id: number | null;
}

export interface ShoppingItemDeleteResponse {
  shopping_item_id: number;
}
