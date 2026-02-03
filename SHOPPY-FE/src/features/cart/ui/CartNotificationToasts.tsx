import React from 'react';
import { Toast } from '@/shared/ui/Toast';
import { useCartNotificationStore } from '../model/useCartNotificationStore';
import './CartNotificationToasts.css';

const CartNotificationToasts: React.FC = () => {
  const toasts = useCartNotificationStore((state) => state.toasts);
  const removeToast = useCartNotificationStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="cart-notification-toasts" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className="cart-notification-toasts__item">
          <Toast
            variant="cart"
            title="장바구니 추가 알림"
            body={`장바구니에 "${item.productName}"이 추가되었습니다.`}
            onClose={() => removeToast(item.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default CartNotificationToasts;
