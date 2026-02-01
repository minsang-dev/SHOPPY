import { create } from 'zustand';

export interface EntranceToastItem {
  id: string;
  nickname: string;
  createdAt: number;
}

interface EntranceNotificationState {
  toasts: EntranceToastItem[];
  addToast: (item: Omit<EntranceToastItem, 'id' | 'createdAt'>) => void;
  removeToast: (id: string) => void;
}

export const useEntranceNotificationStore = create<EntranceNotificationState>((set) => ({
  toasts: [],
  addToast: (item) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...item,
          id: `entrance-toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: Date.now(),
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
