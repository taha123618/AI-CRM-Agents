import { apiClient } from '@/lib/api/client';
import {
  Language,
  LanguageTranslationsResponse,
  TranslationsDictionary,
  LanguageExportData,
} from '../types/language.types';

export const languagesApi = {
  // Fetch supported languages
  getLanguages: async (enabledOnly = false): Promise<Language[]> => {
    const { data } = await apiClient.get<Language[]>('/api/languages', {
      params: { enabled_only: enabledOnly },
    });
    return data;
  },

  // Get single language
  getLanguage: async (code: string): Promise<Language> => {
    const { data } = await apiClient.get<Language>(`/api/languages/${code}`);
    return data;
  },

  // Create language
  createLanguage: async (payload: Partial<Language>): Promise<{ status: string; language: Language }> => {
    const { data } = await apiClient.post('/api/languages', payload);
    return data;
  },

  // Update language
  updateLanguage: async (code: string, payload: Partial<Language>): Promise<{ status: string; language: Language }> => {
    const { data } = await apiClient.put(`/api/languages/${code}`, payload);
    return data;
  },

  // Delete language
  deleteLanguage: async (code: string): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.delete(`/api/languages/${code}`);
    return data;
  },

  // Fetch translations for a language
  getTranslations: async (
    code: string,
    namespace?: string,
    fallback = true
  ): Promise<LanguageTranslationsResponse> => {
    const { data } = await apiClient.get<LanguageTranslationsResponse>(`/api/languages/${code}/translations`, {
      params: { namespace, fallback },
    });
    return data;
  },

  // Bulk upsert translations
  bulkUpsertTranslations: async (
    code: string,
    translations: TranslationsDictionary
  ): Promise<{ status: string; count: number }> => {
    const { data } = await apiClient.post(`/api/languages/${code}/translations`, { translations });
    return data;
  },

  // Update single translation key
  updateSingleTranslation: async (
    code: string,
    namespace: string,
    key: string,
    value: string
  ): Promise<{ status: string; translation: any }> => {
    const { data } = await apiClient.put(`/api/languages/${code}/translations/${namespace}/${key}`, {
      value,
      is_auto_translated: false,
    });
    return data;
  },

  // Fetch available namespaces
  getNamespaces: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>('/api/languages/namespaces');
    return data;
  },

  // Fetch translation audit logs
  getAudits: async (code?: string, limit = 50): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>('/api/languages/audits', {
      params: { code, limit },
    });
    return data;
  },

  // Get user preference
  getUserPreference: async (userId = 'default_user'): Promise<any> => {
    const { data } = await apiClient.get<any>('/api/languages/preferences/me', {
      params: { user_id: userId },
    });
    return data;
  },

  // Update user preference
  setUserPreference: async (payload: any, userId = 'default_user'): Promise<any> => {
    const { data } = await apiClient.put<any>('/api/languages/preferences/me', payload, {
      params: { user_id: userId },
    });
    return data;
  },

  // Delete single translation key
  deleteSingleTranslation: async (
    code: string,
    namespace: string,
    key: string
  ): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.delete(`/api/languages/${code}/translations/${namespace}/${key}`);
    return data;
  },

  // Export language dictionary
  exportLanguage: async (code: string): Promise<LanguageExportData> => {
    const { data } = await apiClient.get<LanguageExportData>(`/api/languages/${code}/export`);
    return data;
  },

  // Import language dictionary
  importLanguage: async (code: string, payload: any): Promise<{ status: string; count: number }> => {
    const { data } = await apiClient.post(`/api/languages/${code}/import`, payload);
    return data;
  },
};
