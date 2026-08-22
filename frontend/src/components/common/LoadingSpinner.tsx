import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', label, className }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-6', className)}>
      <Loader2 className={cn('animate-spin text-brand-400', sizeMap[size])} />
      {label && <span className="text-xs text-muted-foreground font-medium animate-pulse">{label}</span>}
    </div>
  );
}
