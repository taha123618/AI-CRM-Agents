/**
 * Locale-aware internationalization formatters
 */

export function formatLocaleCurrency(
  amount: number,
  locale: string = 'en',
  currency: string = 'USD'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString('en-US')}`;
  }
}

export function formatLocaleNumber(amount: number, locale: string = 'en'): string {
  try {
    return new Intl.NumberFormat(locale).format(amount);
  } catch {
    return amount.toLocaleString();
  }
}

export function formatLocaleDate(
  dateInput: string | number | Date,
  locale: string = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch {
    return String(dateInput);
  }
}

export function formatLocaleTime(
  dateInput: string | number | Date,
  locale: string = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch {
    return String(dateInput);
  }
}
