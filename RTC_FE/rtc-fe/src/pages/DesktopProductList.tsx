import { useEffect, useState } from 'react';
import { getProductList } from '../api/productListApi';
import type { Product } from '../types/product';
import Header from '../components/DesktopHeader/Header';
import './DesktopProductList.css';

const DesktopProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  <button className="cart-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.66L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.5C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z"
                        fill="currentColor"
                      />
                    </svg>
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
