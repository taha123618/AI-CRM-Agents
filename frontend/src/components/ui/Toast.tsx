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
        'flex items-start gap-3 p-4 rounded-none border shadow-2xl backdrop-blur-md transition-none max-w-sm w-full pointer-events-auto',
        isSuccess && 'bg-[#1A1F26] border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
        isError && 'bg-[#1A1F26] border-[#FF2A54]/60 text-rose-100 shadow-[0_0_15px_rgba(255,42,84,0.25)]',
        !isSuccess && !isError && 'bg-[#1A1F26] border-[#252b36] text-white'
      )}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {isError && <AlertCircle className="w-5 h-5 text-[#FF2A54]" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold leading-tight font-mono uppercase tracking-wider">{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] opacity-80 mt-1 leading-snug break-words">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-none p-1 rounded-none hover:bg-[#252b36]"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

