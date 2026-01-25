import { useEffect } from 'react';
import { useAddToCart } from '../../../features/cart/add-to-cart/model/useAddToCart';
import { useProductList } from '../../../features/product/fetch-products/model/useProductList';
import Header from '../../../widgets/desktop/Header/Header';

import SearchBar from '../../../widgets/desktop/SearchBar/SearchBar';
import SortOptions from '../../../widgets/desktop/SortOptions/SortOptions';
import './styles.css';

const DesktopProductList = () => {
  const { products, loading, error, search, reload } = useProductList();
  const addToCart = useAddToCart();

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSearch = (keyword: string) => {
    void search(keyword);
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
