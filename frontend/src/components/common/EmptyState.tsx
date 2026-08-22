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
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-none border border-dashed border-border bg-card/50 max-w-lg mx-auto my-6 font-mono',
        className
      )}
    >
      <div className="w-12 h-12 rounded-none bg-background text-primary flex items-center justify-center mb-4 border border-border">
        {icon || <Inbox className="w-6 h-6" />}
      </div>

      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-[11px] text-muted-foreground max-w-sm mb-6 leading-relaxed uppercase">{description}</p>

      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction} className="text-xs uppercase">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
