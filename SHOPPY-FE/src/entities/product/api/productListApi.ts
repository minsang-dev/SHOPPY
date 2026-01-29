import type { Product } from '../types/desktopProductList';
import type { Product as ApiProduct, ProductListResponse } from '../../../shared/api/types';
import { getProducts, searchProducts } from '../../../shared/api/products';

const extractItems = (response: ProductListResponse): ApiProduct[] =>
  Array.isArray(response) ? response : response.items;

// 상품 전체 목록, keyword가 있을 경우 검색 결과 필터링
export const getProductList = async (keyword?: string): Promise<Product[]> => {
  if (keyword) {
    const response = await searchProducts(keyword);
    return extractItems(response).map((item) => ({
      // 백엔드가 camelCase로 응답하므로 둘 다 처리
      product_id: item.product_id ?? (item as unknown as { productId: number }).productId,
      name: item.name,
      price: item.price,
      image_url: item.image_url ?? (item as unknown as { imageUrl: string }).imageUrl,
    }));
  }

  const response = await getProducts();
  return extractItems(response).map((item) => ({
    // 백엔드가 camelCase로 응답하므로 둘 다 처리
    product_id: item.product_id ?? (item as unknown as { productId: number }).productId,
    name: item.name,
    price: item.price,
    image_url: item.image_url ?? (item as unknown as { imageUrl: string }).imageUrl,
  }));
};
