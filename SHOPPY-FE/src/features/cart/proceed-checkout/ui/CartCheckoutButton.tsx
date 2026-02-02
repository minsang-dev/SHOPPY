import React from 'react';
import './CartCheckoutButton.css';

interface CartCheckoutButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CartCheckoutButton: React.FC<CartCheckoutButtonProps> = ({
  onClick,
  disabled = false,
}) => (
  <button
    type="button"
    className="cart-checkout-button"
    onClick={onClick}
    disabled={disabled}
  >
    결제하기
  </button>
);

export default CartCheckoutButton;
