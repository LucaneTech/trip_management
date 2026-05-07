import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (access?: string | null, refresh?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,

  setUser: (user) => set({ user }),

  setTokens: (access, refresh) => {
    if (access) localStorage.setItem('accessToken', access);
    else localStorage.removeItem('accessToken');
    if (refresh) localStorage.setItem('refreshToken', refresh);
    else localStorage.removeItem('refreshToken');
    set({ accessToken: access ?? null, refreshToken: refresh ?? null });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
