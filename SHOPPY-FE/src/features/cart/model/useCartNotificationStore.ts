import { create } from 'zustand';

export interface CartToastItem {
  id: string;
  nickname: string;
  productName: string;
  createdAt: number;
}

interface CartNotificationState {
  toasts: CartToastItem[];
  addToast: (item: Omit<CartToastItem, 'id' | 'createdAt'>) => void;
  removeToast: (id: string) => void;
}

export const useCartNotificationStore = create<CartNotificationState>((set) => ({
  toasts: [],
  addToast: (item) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...item,
          id: `cart-toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: Date.now(),
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
