import React from 'react';
import { cn, getStatusBadgeClass } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  statusValue?: string;
}

export function Badge({ className, variant, statusValue, children, ...props }: BadgeProps) {
  let styleClass = 'bg-slate-800 text-slate-300 border-slate-700';

  if (statusValue) {
    styleClass = getStatusBadgeClass(statusValue);
  } else if (variant === 'success') {
    styleClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (variant === 'warning') {
    styleClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (variant === 'danger') {
    styleClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (variant === 'info') {
    styleClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (variant === 'purple') {
    styleClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        styleClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
