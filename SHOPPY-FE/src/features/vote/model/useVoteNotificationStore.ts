import { create } from 'zustand';

export interface VoteToastItem {
  id: string;
  title: string;
  voteTitle: string;
  /** 큰따옴표로 표시할 투표 제목 */
  voteSubject: string;
  createdAt: number;
}

interface VoteNotificationState {
  toasts: VoteToastItem[];
  addToast: (item: Omit<VoteToastItem, 'id' | 'createdAt'>) => void;
  removeToast: (id: string) => void;
}

export const useVoteNotificationStore = create<VoteNotificationState>((set) => ({
  toasts: [],
  addToast: (item) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...item,
          id: `vote-toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: Date.now(),
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
