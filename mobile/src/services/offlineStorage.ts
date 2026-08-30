/**
 * Centralized Offline Storage & Action Queue Manager
 * Provides hardened persistence and secure credential sanitization.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { OfflineAction, Deal, VoiceNote, CustomFieldDefinition } from '@/types';

export const OfflineStorage = {
  // Generic Get & Set
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value);
      await AsyncStorage.setItem(key, json);
    } catch (e) {
      if (Config.IS_DEV) {
        console.warn(`[OfflineStorage] Failed to set ${key}`, e);
      }
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const json = await AsyncStorage.getItem(key);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      if (Config.IS_DEV) {
        console.warn(`[OfflineStorage] Failed to get ${key}`, e);
      }
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      if (Config.IS_DEV) {
        console.warn(`[OfflineStorage] Failed to remove ${key}`, e);
      }
    }
  },

  // Deals Cache
  async getCachedDeals(): Promise<Deal[]> {
    const deals = await this.getItem<Deal[]>(Config.STORAGE_KEYS.DEALS_CACHE);
    return deals || [];
  },

  async saveCachedDeals(deals: Deal[]): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.DEALS_CACHE, deals);
  },

  // Voice Notes Cache
  async getCachedVoiceNotes(): Promise<VoiceNote[]> {
    const notes = await this.getItem<VoiceNote[]>(Config.STORAGE_KEYS.VOICE_NOTES_CACHE);
    return notes || [];
  },

  async saveCachedVoiceNotes(notes: VoiceNote[]): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.VOICE_NOTES_CACHE, notes);
  },

  // Custom Fields Cache
  async getCachedCustomFields(entityType: string): Promise<CustomFieldDefinition[]> {
    const all = await this.getItem<Record<string, CustomFieldDefinition[]>>(
      Config.STORAGE_KEYS.CUSTOM_FIELDS_CACHE
    );
    return all?.[entityType] || [];
  },

  async saveCachedCustomFields(entityType: string, fields: CustomFieldDefinition[]): Promise<void> {
    const all =
      (await this.getItem<Record<string, CustomFieldDefinition[]>>(
        Config.STORAGE_KEYS.CUSTOM_FIELDS_CACHE
      )) || {};
    all[entityType] = fields;
    await this.setItem(Config.STORAGE_KEYS.CUSTOM_FIELDS_CACHE, all);
  },

  // Offline Action Queue
  async getOfflineQueue(): Promise<OfflineAction[]> {
    const queue = await this.getItem<OfflineAction[]>(Config.STORAGE_KEYS.OFFLINE_QUEUE);
    return queue || [];
  },

  async enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'created_at' | 'retry_count'>): Promise<OfflineAction> {
    const queue = await this.getOfflineQueue();
    const newAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      retry_count: 0,
    };
    queue.push(newAction);
    await this.setItem(Config.STORAGE_KEYS.OFFLINE_QUEUE, queue);
    return newAction;
  },

  async dequeueOfflineAction(actionId: string): Promise<void> {
    const queue = await this.getOfflineQueue();
    const updated = queue.filter((a) => a.id !== actionId);
    await this.setItem(Config.STORAGE_KEYS.OFFLINE_QUEUE, updated);
  },

  async clearOfflineQueue(): Promise<void> {
    await this.setItem(Config.STORAGE_KEYS.OFFLINE_QUEUE, []);
  },

  // Wipe all session tokens & sensitive user caches on logout
  async clearAllUserData(): Promise<void> {
    const keys = [
      Config.STORAGE_KEYS.AUTH_TOKEN,
      Config.STORAGE_KEYS.REFRESH_TOKEN,
      Config.STORAGE_KEYS.USER_PROFILE,
      Config.STORAGE_KEYS.DEALS_CACHE,
      Config.STORAGE_KEYS.VOICE_NOTES_CACHE,
      Config.STORAGE_KEYS.CUSTOM_FIELDS_CACHE,
      Config.STORAGE_KEYS.NOTIFICATIONS_CACHE,
    ];
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      if (Config.IS_DEV) {
        console.warn('[OfflineStorage] Error scrubbing user data', e);
      }
    }
  },
};
