import { create } from 'zustand';

// 로그인 모달을 어디서든 띄울 수 있게 전역 상태로
interface ModalState {
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));
