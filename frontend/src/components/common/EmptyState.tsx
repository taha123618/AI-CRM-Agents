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
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-none border border-dashed border-[#252b36] bg-[#1A1F26]/40 max-w-lg mx-auto my-6',
        className
      )}
    >
      <div className="w-12 h-12 rounded-none bg-[#0D0D0D] text-slate-400 flex items-center justify-center mb-4 border border-[#252b36]">
        {icon || <Inbox className="w-6 h-6" />}
      </div>

      <h3 className="text-sm font-bold text-white mb-1 font-mono uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed font-sans">{description}</p>

      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

