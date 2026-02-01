import { create } from 'zustand';
import type { User } from '../types/user.types';

const getStoredUser = (): User | null => {
  const stored = sessionStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null;

  setAuth: (token: string, user?: User) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!sessionStorage.getItem('accessToken'),
  accessToken: sessionStorage.getItem('accessToken'),
  user: getStoredUser(),

  setAuth: (token: string, user?: User) => {
    sessionStorage.setItem('accessToken', token);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    set({ isLoggedIn: true, accessToken: token, user: user ?? null });
  },
  setAccessToken: (token: string | null) => {
    if (token) {
      sessionStorage.setItem('accessToken', token);
      set((state) => ({ ...state, isLoggedIn: true, accessToken: token }));
      return;
    }
    sessionStorage.removeItem('accessToken');
    set((state) => ({ ...state, isLoggedIn: false, accessToken: null }));
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    set({ isLoggedIn: false, accessToken: null, user: null });
  },
}));
