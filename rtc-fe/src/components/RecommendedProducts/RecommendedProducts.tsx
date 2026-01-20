import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './RecommendedProducts.css';

interface RecommendedProductsProps {
  className?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  className = '',
}) => {
  const products = [
    { image: '/images/product1.png', alt: '추천 상품 1' },
    { image: '/images/product2.png', alt: '추천 상품 2' },
    { image: '/images/product3.png', alt: '추천 상품 3' },
    { image: '/images/product4.png', alt: '추천 상품 4' },
  ];

  const handleProductClick = (index: number) => {
    // TODO: 상품 클릭 핸들러
    console.log(`상품 ${index + 1} 클릭`);
  };

  return (
    <section className={`recommended-products ${className}`}>
      <div className="recommended-products-container">
        <h2 className="recommended-products-title">추천 상품</h2>
        <div className="recommended-products-grid">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              image={product.image}
              alt={product.alt}
              onClick={() => handleProductClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts;
