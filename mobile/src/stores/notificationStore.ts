/**
 * Notifications & Alert Triage Store
 */

import { create } from 'zustand';
import { NotificationItem } from '@/types';
import { api } from '@/services/api';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'is_read'>) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const items = await api.getNotifications();
      const unread = items.filter((n) => !n.is_read).length;
      set({ notifications: items, unreadCount: unread, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  addNotification: (item) =>
    set((state) => {
      const newItem: NotificationItem = {
        ...item,
        id: `notif_${Date.now()}`,
        timestamp: 'Just now',
        is_read: false,
      };
      const updated = [newItem, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: state.unreadCount + 1,
      };
    }),
}));
