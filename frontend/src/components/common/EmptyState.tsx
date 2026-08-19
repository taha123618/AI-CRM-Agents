import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#DEDAD3] dark:border-[#35322E] bg-[#FAF9F6] dark:bg-[#1D1B18] max-w-lg mx-auto my-6',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#EAE8E3] dark:bg-[#25231F] text-[#5F5C56] dark:text-[#B9B5AD] flex items-center justify-center mb-4 border border-[#DEDAD3] dark:border-[#35322E]">
        {icon || <Inbox className="w-6 h-6 text-[#5F5C56] dark:text-[#B9B5AD]" />}
      </div>

      <h3 className="text-sm font-semibold text-[#1A1917] dark:text-[#F5F3EE] mb-1">{title}</h3>
      <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] max-w-sm mb-5 leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
