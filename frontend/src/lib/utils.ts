import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale: string = 'en-US', currency: string = 'USD'): string {
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

export function formatNumber(value: number, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return value.toLocaleString();
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'qualified':
    case 'closed_won':
    case 'completed':
    case 'positive':
    case 'low':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

    case 'prospecting':
    case 'qualification':
    case 'proposal':
    case 'negotiation':
    case 'scheduled':
    case 'neutral':
    case 'medium':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';

    case 'high':
    case 'urgent':
    case 'negative':
    case 'closed_lost':
    case 'unqualified':
    case 'lost':
    case 'cancelled':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}
