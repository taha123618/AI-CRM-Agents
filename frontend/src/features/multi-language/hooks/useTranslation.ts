import { useCallback } from 'react';
import { useLanguageStore } from '../stores/useLanguageStore';
import { DEFAULT_ENGLISH_TRANSLATIONS } from '../constants/defaultTranslations';

type InterpolationParams = Record<string, string | number>;

export function useTranslation() {
  const { currentLanguage, currentDirection, translations } = useLanguageStore();

  /**
   * Translate key in 'namespace.key' format.
   * e.g. t('common.save') -> "Save Changes" (or "Guardar Cambios" in Spanish)
   */
  const t = useCallback(
    (keyPath: string, fallbackOrParams?: string | InterpolationParams, params?: InterpolationParams): string => {
      let fallbackText = '';
      let interpolations: InterpolationParams | undefined;

      if (typeof fallbackOrParams === 'string') {
        fallbackText = fallbackOrParams;
        interpolations = params;
      } else if (typeof fallbackOrParams === 'object') {
        interpolations = fallbackOrParams;
      }

      const [namespace, ...keyParts] = keyPath.split('.');
      const key = keyParts.join('.');

      // 1. Try active language from store
      let text: string | undefined;
      const langDict = translations[currentLanguage];
      if (langDict && langDict[namespace] && langDict[namespace][key] !== undefined) {
        text = langDict[namespace][key];
      }

      // 2. Fallback to English dictionary in store
      if (text === undefined && translations['en'] && translations['en'][namespace]) {
        text = translations['en'][namespace][key];
      }

      // 3. Fallback to embedded default constants
      if (text === undefined && DEFAULT_ENGLISH_TRANSLATIONS[namespace]) {
        text = DEFAULT_ENGLISH_TRANSLATIONS[namespace][key];
      }

      // 4. Fallback to provided fallback string or keyPath itself
      if (text === undefined) {
        text = fallbackText || keyPath;
      }

      // 5. Interpolate variables: {count}, {name}, etc.
      if (interpolations && typeof text === 'string') {
        for (const [varKey, varVal] of Object.entries(interpolations)) {
          text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varVal));
        }
      }

      return text;
    },
    [currentLanguage, translations]
  );

  return {
    t,
    currentLanguage,
    currentDirection,
    isRTL: currentDirection === 'rtl',
  };
}
