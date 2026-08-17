import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatNumber, getScoreColor, getStatusBadgeClass } from '../utils';

describe('Utility Functions (src/lib/utils.ts)', () => {
  it('cn merges class names properly with tailwind merge', () => {
    const res = cn('p-4', 'p-2', 'text-white', { 'bg-blue-500': true, 'bg-red-500': false });
    expect(res).toBe('p-2 text-white bg-blue-500');
  });

  it('formatCurrency formats whole numbers without unnecessary cents', () => {
    const formatted = formatCurrency(50000);
    expect(formatted).toContain('50,000');
  });

  it('formatNumber formats thousands with comma separators', () => {
    const formatted = formatNumber(12500);
    expect(formatted).toContain('12,500');
  });

  it('getScoreColor returns emerald for high scores (>=80)', () => {
    expect(getScoreColor(85)).toContain('emerald');
  });

  it('getScoreColor returns blue for medium-high scores (60-79)', () => {
    expect(getScoreColor(65)).toContain('blue');
  });

  it('getScoreColor returns amber for medium scores (40-59)', () => {
    expect(getScoreColor(45)).toContain('amber');
  });

  it('getScoreColor returns rose for low scores (<40)', () => {
    expect(getScoreColor(30)).toContain('rose');
  });

  it('getStatusBadgeClass maps statuses correctly', () => {
    expect(getStatusBadgeClass('qualified')).toContain('emerald');
    expect(getStatusBadgeClass('proposal')).toContain('blue');
    expect(getStatusBadgeClass('urgent')).toContain('rose');
    expect(getStatusBadgeClass('unknown_status')).toContain('slate');
  });
});
