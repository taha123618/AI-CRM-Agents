import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
  if (score >= 60) return 'text-blue-400 bg-blue-950/50 border-blue-800/60';
  if (score >= 40) return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
  return 'text-rose-400 bg-rose-950/50 border-rose-800/60';
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'qualified':
    case 'closed_won':
    case 'completed':
    case 'positive':
    case 'low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    case 'prospecting':
    case 'qualification':
    case 'proposal':
    case 'negotiation':
    case 'scheduled':
    case 'neutral':
    case 'medium':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';

    case 'high':
    case 'urgent':
    case 'negative':
    case 'closed_lost':
    case 'unqualified':
    case 'lost':
    case 'cancelled':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';

    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
