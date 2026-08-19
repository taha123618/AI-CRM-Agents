import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'active' | 'online' | 'idle' | 'warning' | 'error' | 'offline';
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  pulse = true,
  className,
}: StatusIndicatorProps) {
  const colorMap = {
    active: 'bg-emerald-500',
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    warning: 'bg-orange-500',
    error: 'bg-rose-500',
    offline: 'bg-slate-500',
  };

  const ringMap = {
    active: 'bg-emerald-400',
    online: 'bg-emerald-400',
    idle: 'bg-amber-400',
    warning: 'bg-orange-400',
    error: 'bg-rose-400',
    offline: 'bg-slate-400',
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-none opacity-75',
              ringMap[status]
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-none h-2 w-2', colorMap[status])} />
      </span>
      {label && <span className="text-xs font-semibold text-slate-300 capitalize">{label}</span>}
    </div>
  );
}
