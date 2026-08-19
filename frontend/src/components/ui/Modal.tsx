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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0D0D]/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-[#1A1F26] rounded-none p-6 shadow-2xl border border-[#252b36] z-10 max-h-[90vh] overflow-y-auto overflow-x-hidden',
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#252b36]">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-xl font-bold tracking-tight text-white leading-snug break-words">{title}</h2>
            {description && <p className="mt-1 text-xs text-slate-400 leading-normal break-words">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-none p-1.5 text-slate-400 hover:bg-[#252b36] hover:text-white transition-none shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4 min-w-0">{children}</div>
      </div>
    </div>
  );
}

