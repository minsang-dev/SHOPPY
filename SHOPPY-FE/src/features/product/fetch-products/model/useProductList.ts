import { useCallback, useState } from 'react';
import { getProductList } from '../../../../entities/product/api/productListApi';
import type { Product } from '../../../../entities/product/types/desktopProductList';

interface UseProductListState {
  products: Product[];
  loading: boolean;
  error: string | null;
  search: (keyword: string) => Promise<void>;
  reload: () => Promise<void>;
}

export const useProductList = (): UseProductListState => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (keyword?: string) => {
    try {
      setLoading(true);
      const data = await getProductList(keyword);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('상품 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(
    async (keyword: string) => {
      const searchKeyword = keyword.trim() || undefined;
      await fetchProducts(searchKeyword);
    },
    [fetchProducts],
  );

  const reload = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    search,
    reload,
  };
};
