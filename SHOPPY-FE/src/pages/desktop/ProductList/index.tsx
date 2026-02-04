import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAddToCart } from '@/features/cart/add-to-cart/model/useAddToCart';
import { useProductList } from '@/features/product/fetch-products/model/useProductList';
import Header from '@/widgets/desktop/Header/Header';

import SearchBar from '@/widgets/desktop/SearchBar/SearchBar';
import SortOptions from '@/widgets/desktop/SortOptions/SortOptions';
import './styles.css';

const PAGE_SIZE = 20;
const MAX_VISIBLE_PAGES = 5;

const DesktopProductList = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, search, pagination } = useProductList({ pageSize: PAGE_SIZE });
  const addToCart = useAddToCart(roomId || null);

  const keywordFromUrl = searchParams.get('keyword');
  const pageFromUrl = Number(searchParams.get('page') ?? '0');

  // URL keyword → 훅 동기화
  useEffect(() => {
    if (keywordFromUrl != null && keywordFromUrl.trim() !== '') {
      void search(keywordFromUrl.trim());
    }
  }, [keywordFromUrl, search]);

  // URL page → 훅 동기화
  useEffect(() => {
    if (pagination && pageFromUrl >= 0) {
      pagination.goToPage(pageFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl]);

  const handleGoToPage = (page: number) => {
    pagination?.goToPage(page);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
  };

  const handleSearch = (keyword: string) => {
    void search(keyword);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (keyword.trim()) {
        next.set('keyword', keyword.trim());
      } else {
        next.delete('keyword');
      }
      next.delete('page');
      return next;
    });
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="message">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="message error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        {/* 검색 바 */}
        <div className="search-filter-bar">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* 정렬 옵션 */}
        <div className="sort-options-container">
          <SortOptions />
        </div>

        {/* 상품 그리드 */}
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.product_id} className="product-card">
              {/* 이미지 */}
              <div className="image-box">
                <img src={product.image_url} alt={product.name} />
              </div>

              {/* 상품 정보 */}
              <div className="info-box">
                {/* 상품명 */}
                <div className="name-row">
                  <h3 className="name">{product.name}</h3>
                </div>

                {/* 가격과 장바구니 버튼 */}
                <div className="price-row">
                  <div className="price">{product.price.toLocaleString()}원</div>

                  <button className="cart-btn" onClick={() => addToCart(product)}>
                    <i className="fa-solid fa-cart-arrow-down"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 페이징: << < 1 2 3 ... > >> */}
        {pagination && pagination.totalPages > 1 && (() => {
          const { currentPage, totalPages } = pagination;
          const total = totalPages;
          const current = currentPage;
          const half = Math.floor(MAX_VISIBLE_PAGES / 2);
          let start = Math.max(0, current - half);
          const end = Math.min(total - 1, start + MAX_VISIBLE_PAGES - 1);
          if (end - start + 1 < MAX_VISIBLE_PAGES) {
            start = Math.max(0, end - MAX_VISIBLE_PAGES + 1);
          }
          const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

          return (
            <nav className="product-pagination" aria-label="상품 목록 페이지">
              <button
                type="button"
                className="pagination-btn pagination-btn-icon"
                disabled={current <= 0}
                onClick={() => handleGoToPage(0)}
                aria-label="첫 페이지"
              >
                &laquo;
              </button>
              <button
                type="button"
                className="pagination-btn pagination-btn-icon"
                disabled={current <= 0}
                onClick={() => handleGoToPage(current - 1)}
                aria-label="이전 페이지"
              >
                &lsaquo;
              </button>
              <div className="pagination-numbers">
                {pageNumbers.map((pageIndex) => (
                  <button
                    key={pageIndex}
                    type="button"
                    className={`pagination-btn pagination-btn-num ${current === pageIndex ? 'active' : ''}`}
                    onClick={() => handleGoToPage(pageIndex)}
                    aria-label={`${pageIndex + 1}페이지`}
                    aria-current={current === pageIndex ? 'page' : undefined}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="pagination-btn pagination-btn-icon"
                disabled={current >= total - 1}
                onClick={() => handleGoToPage(current + 1)}
                aria-label="다음 페이지"
              >
                &rsaquo;
              </button>
              <button
                type="button"
                className="pagination-btn pagination-btn-icon"
                disabled={current >= total - 1}
                onClick={() => handleGoToPage(total - 1)}
                aria-label="마지막 페이지"
              >
                &raquo;
              </button>
            </nav>
          );
        })()}
      </div>
    </div>
  );
};

export default DesktopProductList;
