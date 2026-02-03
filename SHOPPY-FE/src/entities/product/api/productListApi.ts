import type { Product } from '../types/desktopProductList';
import type {
  Product as ApiProduct,
  ProductListResponse,
  PaginatedProductResponse,
} from '../../../shared/api/types';
import { getProducts, searchProducts } from '../../../shared/api/products';

const toProduct = (item: ApiProduct): Product => ({
  product_id: item.product_id ?? (item as unknown as { productId: number }).productId,
  name: item.name,
  price: item.price,
  image_url: item.image_url ?? (item as unknown as { imageUrl: string }).imageUrl,
});

const extractItems = (
  response: ProductListResponse | PaginatedProductResponse,
): ApiProduct[] => {
  if (Array.isArray(response)) return response;
  if ('items' in response) return response.items;
  return response.content;
};

const isPaginated = (
  response: ProductListResponse | PaginatedProductResponse,
): response is PaginatedProductResponse =>
  typeof response === 'object' && 'content' in response && 'totalPages' in response;

export type ProductListOptions = {
  page?: number;
  size?: number;
};

export type ProductListResult = {
  products: Product[];
  totalPages?: number;
  currentPage?: number;
  totalElements?: number;
};

// 상품 전체 목록, keyword가 있을 경우 검색 결과 필터링. page/size 모두 주면 페이징 적용.
export const getProductList = async (
  keyword?: string,
  options?: ProductListOptions,
): Promise<ProductListResult> => {
  const usePagination =
    options?.page !== undefined && options?.size !== undefined;
  const params = usePagination
    ? { page: options.page, size: options.size }
    : undefined;

  const response = keyword
    ? await searchProducts(keyword, params)
    : await getProducts(params);

  const items = extractItems(response);
  const products = items.map(toProduct);

  if (usePagination && isPaginated(response)) {
    return {
      products,
      totalPages: response.totalPages,
      currentPage: response.number,
      totalElements: response.totalElements,
    };
  }

  return { products };
};
