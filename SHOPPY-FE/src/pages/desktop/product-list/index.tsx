import { useEffect } from 'react';
import { useAddToCart } from '../../../features/cart/add-to-cart/model/useAddToCart';
import { useProductList } from '../../../features/product/fetch-products/model/useProductList';
import Header from '../../../widgets/desktop/DesktopHeader/Header';

import SearchBar from '../../../widgets/desktop/DesktopSearchBar/SearchBar';
import SortOptions from '../../../widgets/desktop/DesktopSortOptions/SortOptions';
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
        <div className="message">濡쒕뵫 以?..</div>
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
        {/* 寃??諛?*/}
        <div className="search-filter-bar">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* ?뺣젹 ?듭뀡 */}
        <div className="sort-options-container">
          <SortOptions />
        </div>

        {/* ?곹뭹 洹몃━??*/}
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.product_id} className="product-card">
              {/* ?대?吏 */}
              <div className="image-box">
                <img src={product.image_url} alt={product.name} />
              </div>

              {/* ?곹뭹 ?뺣낫 */}
              <div className="info-box">
                {/* ?곹뭹紐?*/}
                <div className="name-row">
                  <h3 className="name">{product.name}</h3>
                </div>

                {/* 媛寃⑷낵 ?λ컮援щ땲 踰꾪듉 */}
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

