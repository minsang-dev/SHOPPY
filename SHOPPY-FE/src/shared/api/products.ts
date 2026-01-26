import { apiGet } from './utils';
import type { ProductListResponse } from './types';

export const getProducts = () => apiGet<ProductListResponse>('/products', undefined, true);

export const searchProducts = (keyword: string) =>
  apiGet<ProductListResponse>('/products/search', { keyword }, true);
