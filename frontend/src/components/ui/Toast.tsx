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
        'flex items-start gap-3 p-3.5 rounded-none border shadow-2xl transition-none max-w-sm w-full pointer-events-auto font-mono',
        isSuccess && 'bg-[#121212] border-[#FFB800] text-slate-100',
        isError && 'bg-[#121212] border-[#FF2A54] text-slate-100',
        !isSuccess && !isError && 'bg-[#121212] border-[#3A4552] text-slate-100'
      )}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />}
        {isError && <AlertCircle className="w-4 h-4 text-[#FF2A54]" />}
        {!isSuccess && !isError && <Info className="w-4 h-4 text-cyan-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold leading-tight uppercase">{toast.title}</h4>
        {toast.description && (
          <p className="text-[10px] text-slate-400 mt-1 leading-snug break-words uppercase">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-none p-1"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
