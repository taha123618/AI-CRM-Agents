import React from 'react';
import { cn, getStatusBadgeClass } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  statusValue?: string;
}

export function Badge({ className, variant, statusValue, children, ...props }: BadgeProps) {
  let styleClass = 'bg-background text-muted-foreground border-border';

  if (statusValue) {
    styleClass = getStatusBadgeClass(statusValue);
  } else if (variant === 'success') {
    styleClass = 'bg-background text-primary border-primary/50';
  } else if (variant === 'warning') {
    styleClass = 'bg-background text-amber-400 border-amber-400/50';
  } else if (variant === 'danger') {
    styleClass = 'bg-background text-destructive border-destructive/50';
  } else if (variant === 'info') {
    styleClass = 'bg-background text-cyan-400 border-cyan-400/50';
  } else if (variant === 'purple') {
    styleClass = 'bg-background text-purple-400 border-purple-400/50';
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
