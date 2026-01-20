import React from 'react';
import './ProductCard.css';

interface ProductCardProps {
  image: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  alt,
  className = '',
  onClick,
}) => {
  return (
    <div className={`product-card ${className}`} onClick={onClick}>
      <div className="product-card-image-wrapper">
        <img src={image} alt={alt} className="product-card-image" />
      </div>
    </div>
  );
};

export default ProductCard;
