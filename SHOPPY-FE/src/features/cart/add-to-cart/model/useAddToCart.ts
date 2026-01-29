import { useCallback } from 'react';
import { addShoppingItem } from '@/entities/shopping/api/shopping';
import type { Product } from '@/entities/product/types/desktopProductList';
import type { ShoppingItemAddRequest } from '@/entities/shopping/types/shopping.types';

interface UseAddToCartOptions {
  onSuccess?: () => void;
}

export const useAddToCart = (roomId: string | null, options?: UseAddToCartOptions) => {
  return useCallback(
    async (product: Product) => {
      console.log('장바구니 아이콘 클릭:', {
        상품명: product.name,
        가격: product.price,
        '상품 이미지 url': product.image_url,
      });

      if (!roomId) {
        console.warn('roomId가 없어 장바구니에 추가할 수 없습니다.');
        return;
      }

      const payload: ShoppingItemAddRequest = {
        userId: 0, // TODO: 실제 userId 가져오기
        productId: product.product_id,
        displayName: product.name,
        quantity: 1,
        purchaseType: true, // 온라인
      };

      try {
        await addShoppingItem(roomId, payload);
        // 장바구니 갱신 이벤트 발생
        window.dispatchEvent(new CustomEvent('cart-updated'));
        options?.onSuccess?.();
      } catch (error) {
        console.error('장바구니 추가 실패:', error);
      }
    },
    [roomId, options],
  );
};
