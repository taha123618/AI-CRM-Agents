import React from 'react';
import { cn, getStatusBadgeClass } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  statusValue?: string;
}

export function Badge({ className, variant, statusValue, children, ...props }: BadgeProps) {
  let styleClass = 'bg-[#0B0C10] text-slate-300 border-[#3A4552]';

  if (statusValue) {
    styleClass = getStatusBadgeClass(statusValue);
  } else if (variant === 'success') {
    styleClass = 'bg-[#0B0C10] text-[#39FF14] border-[#39FF14]/50';
  } else if (variant === 'warning') {
    styleClass = 'bg-[#0B0C10] text-amber-400 border-amber-400/50';
  } else if (variant === 'danger') {
    styleClass = 'bg-[#0B0C10] text-[#FF2A54] border-[#FF2A54]/50';
  } else if (variant === 'info') {
    styleClass = 'bg-[#0B0C10] text-cyan-400 border-cyan-400/50';
  } else if (variant === 'purple') {
    styleClass = 'bg-[#0B0C10] text-purple-400 border-purple-400/50';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider border transition-none',
        styleClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
