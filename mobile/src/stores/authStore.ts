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
  register: (payload: { full_name: string; email: string; password: string; role?: string }) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ status: string; message: string }>;
  resetPassword: (payload: { token: string; new_password: string }) => Promise<{ status: string; message: string }>;
  verifyEmail: (token: string) => Promise<{ status: string; message: string }>;
  ssoLogin: (provider: string, token: string, emailHint?: string, nameHint?: string) => Promise<boolean>;
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
      throw e;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await api.register(payload);
      set({
        user: res.user || {
          id: `usr-${Date.now()}`,
          email: payload.email,
          full_name: payload.full_name,
          role: (payload.role as any) || 'sales',
          is_active: true,
        },
        token: res.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      const res = await api.forgotPassword(email);
      set({ isLoading: false });
      return res;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  resetPassword: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await api.resetPassword(payload);
      set({ isLoading: false });
      return res;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true });
    try {
      const res = await api.verifyEmail(token);
      set({ isLoading: false });
      return res;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  ssoLogin: async (provider, token, emailHint, nameHint) => {
    set({ isLoading: true });
    try {
      const res = await api.ssoLogin(provider, token, emailHint, nameHint);
      set({
        user: res.user || {
          id: `usr-sso-${Date.now()}`,
          email: emailHint || `${provider}@enterprise.com`,
          full_name: nameHint || 'SSO Operator',
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

