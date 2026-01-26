// src/types/cart.types.ts
import type { Product } from '../../product/types/desktopProductList';

/**
 * 장바구니에 담기는 상품 아이템 타입
 * Product를 기반으로 하되, 장바구니에 필요한 최소한의 정보만 포함
 */
export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity?: number; // 수량 (기본값: 1)
  likes?: number; // 좋아요 수 (기본값: 0)
  dislikes?: number; // 싫어요 수 (기본값: 0)
  participants?: string[]; // 참여자 ID 목록 (기본값: [])
}

/**
 * Product를 CartItem으로 변환하는 헬퍼 함수
 */
export const productToCartItem = (product: Product): CartItem => {
  return {
    product_id: product.product_id,
    name: product.name,
    price: product.price,
    image_url: product.image_url,
    quantity: 1,
    likes: 0,
    dislikes: 0,
    participants: [],
  };
};
