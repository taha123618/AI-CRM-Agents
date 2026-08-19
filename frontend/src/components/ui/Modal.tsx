import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-mono">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 transition-none"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-[#121212] rounded-none p-5 shadow-2xl border border-[#3A4552] z-10 max-h-[90vh] overflow-y-auto overflow-x-hidden',
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 border-b border-[#3A4552]">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white leading-snug break-words">{title}</h2>
            {description && <p className="mt-0.5 text-xs font-mono uppercase text-slate-400 leading-normal break-words">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-none p-1 text-slate-400 hover:bg-[#0B0C10] hover:text-white transition-none shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-3 min-w-0">{children}</div>
      </div>
    </div>
  );
}
