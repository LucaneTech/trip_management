import { create } from 'zustand';

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  dark: false,
  toggle: () =>
    set((s) => {
      const next = !s.dark;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { dark: next };
    }),
}));
