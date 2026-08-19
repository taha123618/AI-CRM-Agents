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
  if (score >= 80) return 'text-[#64705B] bg-[#EEF0EA] border-[#D8DDD0]';
  if (score >= 60) return 'text-[#806638] bg-[#F3EBDD] border-[#DEC28C]';
  if (score >= 40) return 'text-[#9A6B2F] bg-[#FAF1E4] border-[#ECD8BA]';
  return 'text-[#A64B45] bg-[#FAECEA] border-[#EBCBC7]';
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'qualified':
      return 'bg-[#F3EBDD] text-[#806638] border-[#DEC28C]';

    case 'won':
    case 'closed_won':
    case 'completed':
    case 'positive':
    case 'low':
      return 'bg-[#EEF0EA] text-[#64705B] border-[#D8DDD0]';

    case 'proposal':
      return 'bg-[#ECEAE5] text-[#4A4742] border-[#DEDAD3]';

    case 'negotiation':
    case 'warning':
    case 'medium':
      return 'bg-[#F6EEE2] text-[#9A6B2F] border-[#ECD8BA]';

    case 'lost':
    case 'closed_lost':
    case 'unqualified':
    case 'high':
    case 'urgent':
    case 'negative':
    case 'cancelled':
    case 'at_risk':
      return 'bg-[#FAECEA] text-[#A64B45] border-[#EBCBC7]';

    case 'new':
    case 'prospecting':
    case 'qualification':
    case 'scheduled':
    case 'neutral':
    default:
      return 'bg-[#F1F0EC] text-[#5F5C56] border-[#DEDAD3]';
  }
}
