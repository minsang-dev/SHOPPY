import { apiGet } from './utils';
import type { ProductListResponse, PaginatedProductResponse } from './types';

export type ProductListParams = {
  page?: number;
  size?: number;
};

/** page, size가 모두 있으면 페이징 응답, 없으면 전체 배열 응답 */
export const getProducts = (params?: ProductListParams) =>
  apiGet<ProductListResponse | PaginatedProductResponse>('/products', params as Record<string, unknown>, true);

export const searchProducts = (keyword: string, params?: ProductListParams) =>
  apiGet<ProductListResponse | PaginatedProductResponse>('/products/search', {
    keyword,
    ...(params as Record<string, unknown>),
  }, true);
