import { create } from 'zustand';
import type { User } from '../types/user.types';

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
  user: null,

  setAuth: (token: string, user?: User) => {
    localStorage.setItem('accessToken', token);
    set({ isLoggedIn: true, accessToken: token, user: user ?? null });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ isLoggedIn: false, accessToken: null, user: null });
  },
}));
