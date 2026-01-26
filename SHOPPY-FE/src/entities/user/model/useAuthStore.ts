import { create } from 'zustand';
import type { User } from '../types/user.types';

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null;

  setAuth: (token: string, user?: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken'),
  user: getStoredUser(),

  setAuth: (token: string, user?: User) => {
    localStorage.setItem('accessToken', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ isLoggedIn: true, accessToken: token, user: user ?? null });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ isLoggedIn: false, accessToken: null, user: null });
  },
}));
