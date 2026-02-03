import { create } from 'zustand';

interface ChatNotificationState {
  unreadCount: number;
  increment: () => void;
  reset: () => void;
}

export const useChatNotificationStore = create<ChatNotificationState>((set) => ({
  unreadCount: 0,
  increment: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  reset: () => set({ unreadCount: 0 }),
}));
