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
  pulse = false,
  className,
}: StatusIndicatorProps) {
  const colorMap = {
    active: 'bg-[#64705B]',
    online: 'bg-[#64705B]',
    idle: 'bg-[#9A6B2F]',
    warning: 'bg-[#9A6B2F]',
    error: 'bg-[#A64B45]',
    offline: 'bg-[#85817A]',
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              colorMap[status]
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', colorMap[status])} />
      </span>
      {label && <span className="text-xs font-medium text-[#5F5C56] capitalize">{label}</span>}
    </div>
  );
}
