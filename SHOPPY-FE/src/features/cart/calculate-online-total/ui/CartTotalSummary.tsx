import React from 'react';
import './CartTotalSummary.css';

interface CartTotalSummaryProps {
  total: number;
}

const CartTotalSummary: React.FC<CartTotalSummaryProps> = ({ total }) => (
  <div className="cart-total-summary">
    <span className="cart-total-summary__label">총 금액</span>
    <span className="cart-total-summary__value">{total.toLocaleString()}원</span>
  </div>
);

export default CartTotalSummary;
