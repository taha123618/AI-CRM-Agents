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
        'flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-4 max-w-sm w-full pointer-events-auto',
        isSuccess && 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100',
        isError && 'bg-rose-950/90 border-rose-500/40 text-rose-100',
        !isSuccess && !isError && 'bg-slate-900/90 border-slate-800 text-slate-100'
      )}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] opacity-80 mt-1 leading-snug break-words">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
