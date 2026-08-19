import React from 'react';
import { cn, getStatusBadgeClass } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  statusValue?: string;
}

export function Badge({ className, variant, statusValue, children, ...props }: BadgeProps) {
  let styleClass = 'bg-[#1A1F26] text-slate-300 border-[#252b36]';

  if (statusValue) {
    styleClass = getStatusBadgeClass(statusValue);
  } else if (variant === 'success') {
    styleClass = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
  } else if (variant === 'warning') {
    styleClass = 'bg-amber-950/40 text-amber-400 border-amber-500/30';
  } else if (variant === 'danger') {
    styleClass = 'bg-[#FF2A54]/15 text-[#FF2A54] border-[#FF2A54]/30';
  } else if (variant === 'info') {
    styleClass = 'bg-blue-950/40 text-blue-400 border-blue-500/30';
  } else if (variant === 'purple') {
    styleClass = 'bg-purple-950/40 text-purple-400 border-purple-500/30';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-mono font-medium border transition-none uppercase tracking-wider',
        styleClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

