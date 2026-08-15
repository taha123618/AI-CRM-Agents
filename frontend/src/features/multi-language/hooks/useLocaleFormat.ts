import { useCallback } from 'react';
import { useLanguageStore } from '../stores/useLanguageStore';
import {
  formatLocaleCurrency,
  formatLocaleNumber,
  formatLocaleDate,
  formatLocaleTime,
} from '../utils/localeFormatters';

export function useLocaleFormat() {
  const { currentLanguage } = useLanguageStore();

  const formatCurrency = useCallback(
    (amount: number, currency: string = 'USD') => {
      return formatLocaleCurrency(amount, currentLanguage, currency);
    },
    [currentLanguage]
  );

  const formatNumber = useCallback(
    (amount: number) => {
      return formatLocaleNumber(amount, currentLanguage);
    },
    [currentLanguage]
  );

  const formatDate = useCallback(
    (date: string | number | Date, options?: Intl.DateTimeFormatOptions) => {
      return formatLocaleDate(date, currentLanguage, options);
    },
    [currentLanguage]
  );

  const formatTime = useCallback(
    (date: string | number | Date, options?: Intl.DateTimeFormatOptions) => {
      return formatLocaleTime(date, currentLanguage, options);
    },
    [currentLanguage]
  );

  return {
    locale: currentLanguage,
    formatCurrency,
    formatNumber,
    formatDate,
    formatTime,
  };
}
