/**
 * Theme State Store
 * Controls dark/light/system theme mode preference with persistent storage
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'dark' | 'light' | 'system';

interface ThemeState {
  themeMode: ThemePreference;
  isLoaded: boolean;
  setThemeMode: (mode: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'crm_mobile_theme_mode';

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark', // Default to Void Black tactical theme
  isLoaded: false,

  loadTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        set({ themeMode: saved, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  setThemeMode: async (mode: ThemePreference) => {
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  },

  toggleTheme: async () => {
    const current = get().themeMode;
    const nextMode: ThemePreference = current === 'dark' ? 'light' : 'dark';
    set({ themeMode: nextMode });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch {}
  },
}));

// Immediately initialize theme on store creation
useThemeStore.getState().loadTheme().catch(() => {});
