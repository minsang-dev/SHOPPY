import type { ShoppingItem } from '@/entities/shopping/types/shopping.types';

export type ProductMetaMap = Record<number, { imageUrl: string; price: number }>;

/**
 * 온라인 장바구니 아이템들의 총액 계산
 * @param items 온라인 장바구니 아이템 
 * @param productMetaMap productId → { price } 매핑
 */
export const calcOnlineCartTotal = (
  items: ShoppingItem[],
  productMetaMap: ProductMetaMap
): number => {
  return items.reduce((sum, item) => {
    if (item.productId == null) return sum;
    const meta = productMetaMap[item.productId];
    if (!meta) return sum;
    return sum + meta.price * (item.quantity ?? 1);
  }, 0);
};
