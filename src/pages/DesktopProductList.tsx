import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/useCartStore'

import { getProductList } from '../api/productListApi';
import type { Product } from '../types/desktopProductList';
import Header from '../components/DesktopHeader/Header';

import SearchBar from '../components/DesktopSearchBar/SearchBar';
import SortOptions from '../components/DesktopSortOptions/SortOptions';
import './DesktopProductList.css';

const DesktopProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCartStore((state) => state.addToOnlineCart);

  // 초기 마운트 시 전체 목록 조회
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProductList();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('상품 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 검색 버튼 클릭 시 백엔드로 요청
  const handleSearch = (keyword: string) => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // 검색어가 있으면 검색 API 호출, 없으면 전체 목록 조회
        const searchKeyword = keyword.trim() || undefined;
        const data = await getProductList(searchKeyword);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('상품 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
      </div>
    </div>
  );
};

export default DesktopProductList;
