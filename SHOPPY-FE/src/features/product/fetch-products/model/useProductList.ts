import { useEffect } from 'react';
import { useCallback, useState } from 'react';
import { getProductList } from '@/entities/product/api/productListApi';
import type { Product } from '@/entities/product/types/desktopProductList';

export type UseProductListOptions = {
  /** 페이지당 개수. 지정 시 페이징 모드로 동작 */
  pageSize?: number;
};

interface UseProductListState {
  products: Product[];
  loading: boolean;
  error: string | null;
  search: (keyword: string) => Promise<void>;
  reload: () => Promise<void>;
  /** 페이징 모드일 때만 유효 */
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    goToPage: (page: number) => void;
  } | null;
}

export const useProductList = (options?: UseProductListOptions): UseProductListState => {
  const { pageSize = 0 } = options ?? {};
  const usePagination = pageSize > 0;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(undefined);

  const fetchProducts = useCallback(
    async (keyword?: string, page = 0) => {
      try {
        setLoading(true);
        const opts = usePagination ? { page, size: pageSize } : undefined;
        const result = await getProductList(keyword, opts);
        setProducts(result.products);
        if (result.totalPages !== undefined) {
          setTotalPages(result.totalPages);
          setCurrentPage(result.currentPage ?? 0);
          setTotalElements(result.totalElements ?? 0);
        }
      } catch (err) {
        setError('상품 목록을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [usePagination, pageSize],
  );

  const pageToFetch = usePagination ? currentPage : 0;
  useEffect(() => {
    void fetchProducts(searchKeyword, pageToFetch);
  }, [fetchProducts, searchKeyword, usePagination, pageToFetch]);

  const search = useCallback(
    async (keyword: string) => {
      const k = keyword.trim() || undefined;
      setSearchKeyword(k);
      setCurrentPage(0);
      if (!usePagination) {
        await fetchProducts(k);
      }
    },
    [fetchProducts, usePagination],
  );

  const reload = useCallback(async () => {
    await fetchProducts(searchKeyword, currentPage);
  }, [fetchProducts, searchKeyword, currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 0 || page >= totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  return {
    products,
    loading,
    error,
    search,
    reload,
    pagination: usePagination
      ? {
          currentPage,
          totalPages,
          totalElements,
          goToPage,
        }
      : null,
  };
};
