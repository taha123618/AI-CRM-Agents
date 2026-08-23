/**
 * Auth State Management Store
 * Handles session tokens, namespaced persistent storage, and secure authentication state.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { User } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.login(email, password);
      set({
        user: res.user || {
          id: 'usr-1',
          email,
          full_name: email.split('@')[0],
          role: 'sales',
          is_active: true,
        },
        token: res.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (e) {
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await api.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await AsyncStorage.getItem(Config.STORAGE_KEYS.USER_PROFILE);
      if (token) {
        set({
          token,
          user: userJson ? JSON.parse(userJson) : null,
          isAuthenticated: true,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      }
    } catch {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
