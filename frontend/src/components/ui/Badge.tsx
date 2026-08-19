import React from 'react';
import { cn, getStatusBadgeClass } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'accent';
  statusValue?: string;
}

export function Badge({ className, variant, statusValue, children, ...props }: BadgeProps) {
  let styleClass = 'bg-[#F1F0EC] text-[#5F5C56] border-[#DEDAD3]';

  if (statusValue) {
    styleClass = getStatusBadgeClass(statusValue);
  } else if (variant === 'success') {
    styleClass = 'bg-[#EEF0EA] text-[#64705B] border-[#D8DDD0]';
  } else if (variant === 'warning') {
    styleClass = 'bg-[#FAF1E4] text-[#9A6B2F] border-[#ECD8BA]';
  } else if (variant === 'danger') {
    styleClass = 'bg-[#FAECEA] text-[#A64B45] border-[#EBCBC7]';
  } else if (variant === 'info' || variant === 'purple') {
    styleClass = 'bg-[#F0EFEB] text-[#5F5C56] border-[#DCD9D2]';
  } else if (variant === 'accent') {
    styleClass = 'bg-[#FAF3E6] text-[#806638] border-[#DEC28C]';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        styleClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
