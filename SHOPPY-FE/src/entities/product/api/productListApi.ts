import type { Product } from '../types/desktopProductList';
import { getProducts, searchProducts } from '../../../shared/api/products';

// 상품 전체 목록, keyword가 있을 경우 검색 결과 필터링
export const getProductList = async (keyword?: string): Promise<Product[]> => {
  if (keyword) {
    const response = await searchProducts(keyword);
    return response.items.map((item) => ({
      product_id: item.product_id,
      name: item.product_name,
      price: item.price,
      image_url: item.image_url,
    }));
  }

  const response = await getProducts();
  return response.items.map((item) => ({
    product_id: item.product_id,
    name: item.product_name,
    price: item.price,
    image_url: item.image_url,
  }));
};
