import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-none border shadow-2xl transition-none max-w-sm w-full pointer-events-auto font-mono bg-card text-card-foreground',
        isSuccess && 'border-primary',
        isError && 'border-destructive',
        !isSuccess && !isError && 'border-border'
      )}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-primary" />}
        {isError && <AlertCircle className="w-4 h-4 text-destructive" />}
        {!isSuccess && !isError && <Info className="w-4 h-4 text-cyan-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold leading-tight uppercase text-foreground">{toast.title}</h4>
        {toast.description && (
          <p className="text-[10px] text-muted-foreground mt-1 leading-snug break-words uppercase">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-none p-1"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
