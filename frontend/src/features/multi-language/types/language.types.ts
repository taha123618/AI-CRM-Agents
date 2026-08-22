export type TextDirection = 'ltr' | 'rtl';

export interface Language {
  code: string;
  name: string;
  english_name: string;
  direction: TextDirection;
  is_default: boolean;
  is_enabled: boolean;
  flag_emoji: string;
  created_at?: string;
  updated_at?: string;
}

export interface TranslationRecord {
  id?: string;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
  is_auto_translated?: boolean;
  updated_at?: string;
}

export type TranslationsDictionary = Record<string, Record<string, string>>;

export interface LanguageTranslationsResponse {
  language_code: string;
  direction: TextDirection;
  is_default: boolean;
  namespace: string;
  fallback_applied: boolean;
  translations: TranslationsDictionary;
}

export interface LanguageExportData {
  meta: {
    language_code: string;
    name: string;
    english_name: string;
    direction: TextDirection;
    flag_emoji: string;
    exported_at: string;
  };
  translations: TranslationsDictionary;
}
