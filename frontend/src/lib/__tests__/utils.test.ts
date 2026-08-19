import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatNumber, getScoreColor, getStatusBadgeClass } from '../utils';

describe('Utility Functions (src/lib/utils.ts)', () => {
  it('cn merges class names properly with tailwind merge', () => {
    const res = cn('p-4', 'p-2', 'text-white', { 'bg-neutral-900': true, 'bg-red-500': false });
    expect(res).toBe('p-2 text-white bg-neutral-900');
  });

  it('formatCurrency formats whole numbers without unnecessary cents', () => {
    const formatted = formatCurrency(50000);
    expect(formatted).toContain('50,000');
  });

  it('formatNumber formats thousands with comma separators', () => {
    const formatted = formatNumber(12500);
    expect(formatted).toContain('12,500');
  });

  it('getScoreColor returns muted olive for high scores (>=80)', () => {
    expect(getScoreColor(85)).toContain('#64705B');
  });

  it('getScoreColor returns muted gold for medium-high scores (60-79)', () => {
    expect(getScoreColor(65)).toContain('#806638');
  });

  it('getScoreColor returns muted amber for medium scores (40-59)', () => {
    expect(getScoreColor(45)).toContain('#9A6B2F');
  });

  it('getScoreColor returns muted brick red for low scores (<40)', () => {
    expect(getScoreColor(30)).toContain('#A64B45');
  });

  it('getStatusBadgeClass maps statuses to premium neutral tokens correctly', () => {
    expect(getStatusBadgeClass('qualified')).toContain('#806638');
    expect(getStatusBadgeClass('won')).toContain('#64705B');
    expect(getStatusBadgeClass('proposal')).toContain('#4A4742');
    expect(getStatusBadgeClass('urgent')).toContain('#A64B45');
    expect(getStatusBadgeClass('unknown_status')).toContain('#5F5C56');
  });
});
