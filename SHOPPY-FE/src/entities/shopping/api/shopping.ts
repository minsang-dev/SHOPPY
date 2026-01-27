import axios from 'axios';
import type {
  ShoppingItemAddRequest,
  ShoppingItemDeleteResponse,
  ShoppingItemUpdateRequest,
  ShoppingItemUpdateResponse,
  ShoppingListResponse,
} from '../types/shopping.types';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const getShoppingList = async (roomId: string): Promise<ShoppingListResponse> => {
  const response = await axios.get<ApiResponse<ShoppingListResponse>>(
    `${API_BASE_URL}/api/rooms/${roomId}/shopping-items`,
  );
  return response.data.data;
};

export const addShoppingItem = async (
  roomId: string,
  payload: ShoppingItemAddRequest,
): Promise<void> => {
  await axios.post<ApiResponse<void>>(
    `${API_BASE_URL}/api/rooms/${roomId}/shopping-items`,
    payload,
  );
};

export const updateShoppingItem = async (
  roomId: string,
  shoppingItemId: number,
  payload: ShoppingItemUpdateRequest,
): Promise<ShoppingItemUpdateResponse> => {
  const response = await axios.patch<ApiResponse<ShoppingItemUpdateResponse>>(
    `${API_BASE_URL}/api/rooms/${roomId}/shopping-items/${shoppingItemId}`,
    payload,
  );
  return response.data.data;
};

export const deleteShoppingItem = async (
  roomId: string,
  shoppingItemId: number,
): Promise<ShoppingItemDeleteResponse> => {
  const response = await axios.delete<ApiResponse<ShoppingItemDeleteResponse>>(
    `${API_BASE_URL}/api/rooms/${roomId}/shopping-items/${shoppingItemId}`,
  );
  return response.data.data;
};
