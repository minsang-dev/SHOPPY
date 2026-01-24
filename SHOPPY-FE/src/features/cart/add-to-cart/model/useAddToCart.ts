import { useCallback } from 'react';
import { useCartStore } from '../../../../entities/cart/model/useCartStore';
import type { Product } from '../../../../entities/product/types/desktopProductList';

export const useAddToCart = () => {
  const addToCart = useCartStore((state) => state.addToOnlineCart);

  return useCallback(
    (product: Product) => {
      addToCart(product);
    },
    [addToCart],
  );
};
