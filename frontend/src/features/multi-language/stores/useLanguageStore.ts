import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, TextDirection, TranslationsDictionary } from '../types/language.types';
import { DEFAULT_ENGLISH_TRANSLATIONS, DEFAULT_URDU_TRANSLATIONS } from '../constants/defaultTranslations';
import { applyDocumentLanguageAndDirection } from '../utils/direction';
import { languagesApi } from '../api/languagesApi';

interface LanguageState {
  currentLanguage: string; // e.g. 'en', 'es', 'ar', 'ur'
  currentDirection: TextDirection;
  availableLanguages: Language[];
  translations: Record<string, TranslationsDictionary>; // { [langCode]: { [namespace]: { [key]: value } } }
  isLoadingTranslations: boolean;
  error: string | null;

  // Actions
  setLanguage: (code: string) => Promise<void>;
  fetchLanguages: () => Promise<void>;
  fetchTranslationsForLanguage: (code: string) => Promise<void>;
  updateTranslationInMemory: (langCode: string, namespace: string, key: string, value: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      currentDirection: 'ltr',
      availableLanguages: [
        { code: 'en', name: 'English', english_name: 'English', direction: 'ltr', is_default: true, is_enabled: true, flag_emoji: '🇺🇸' },
        { code: 'es', name: 'Español', english_name: 'Spanish', direction: 'ltr', is_default: false, is_enabled: true, flag_emoji: '🇪🇸' },
        { code: 'fr', name: 'Français', english_name: 'French', direction: 'ltr', is_default: false, is_enabled: true, flag_emoji: '🇫🇷' },
        { code: 'de', name: 'Deutsch', english_name: 'German', direction: 'ltr', is_default: false, is_enabled: true, flag_emoji: '🇩🇪' },
        { code: 'ar', name: 'العربية', english_name: 'Arabic', direction: 'rtl', is_default: false, is_enabled: true, flag_emoji: '🇸🇦' },
        { code: 'ur', name: 'اردو', english_name: 'Urdu', direction: 'rtl', is_default: false, is_enabled: true, flag_emoji: '🇵🇰' },
        { code: 'ja', name: '日本語', english_name: 'Japanese', direction: 'ltr', is_default: false, is_enabled: true, flag_emoji: '🇯🇵' },
        { code: 'zh', name: '中文 (简体)', english_name: 'Chinese (Simplified)', direction: 'ltr', is_default: false, is_enabled: true, flag_emoji: '🇨🇳' },
      ],
      translations: {
        en: DEFAULT_ENGLISH_TRANSLATIONS,
        ur: DEFAULT_URDU_TRANSLATIONS,
      },
      isLoadingTranslations: false,
      error: null,

      setLanguage: async (code: string) => {
        const lang = get().availableLanguages.find((l) => l.code === code);
        const direction: TextDirection = lang?.direction || (['ar', 'ur', 'fa', 'he'].includes(code) ? 'rtl' : 'ltr');

        set({ currentLanguage: code, currentDirection: direction });
        applyDocumentLanguageAndDirection(code, direction);

        // Always ensure translation bundle is loaded and fresh
        await get().fetchTranslationsForLanguage(code);
      },

      fetchLanguages: async () => {
        try {
          const langs = await languagesApi.getLanguages();
          if (langs && langs.length > 0) {
            set({ availableLanguages: langs });

            // Ensure current language direction matches latest metadata
            const current = langs.find((l) => l.code === get().currentLanguage);
            if (current) {
              set({ currentDirection: current.direction });
              applyDocumentLanguageAndDirection(current.code, current.direction);
            }
          }
        } catch (err: any) {
          console.warn('Failed to fetch languages from server, using local defaults:', err.message);
        }
      },

      fetchTranslationsForLanguage: async (code: string) => {
        set({ isLoadingTranslations: true, error: null });
        try {
          const response = await languagesApi.getTranslations(code);
          if (response && response.translations) {
            set((state) => ({
              translations: {
                ...state.translations,
                [code]: response.translations,
              },
              isLoadingTranslations: false,
            }));
          }
        } catch (err: any) {
          set({
            error: err.message || 'Failed to load translations',
            isLoadingTranslations: false,
          });
        }
      },

      updateTranslationInMemory: (langCode: string, namespace: string, key: string, value: string) => {
        set((state) => {
          const currentLangDict = state.translations[langCode] || {};
          const currentNsDict = currentLangDict[namespace] || {};

          return {
            translations: {
              ...state.translations,
              [langCode]: {
                ...currentLangDict,
                [namespace]: {
                  ...currentNsDict,
                  [key]: value,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: 'ai_crm_language_preference',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        currentDirection: state.currentDirection,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDocumentLanguageAndDirection(state.currentLanguage, state.currentDirection);
        }
      },
    }
  )
);
