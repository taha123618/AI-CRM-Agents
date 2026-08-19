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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#141311]/70 dark:bg-black/80 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-white dark:bg-[#1D1B18] rounded-2xl p-6 shadow-xl border border-[#E9E6E0] dark:border-[#35322E] z-10 max-h-[90vh] overflow-y-auto overflow-x-hidden text-[#1A1917] dark:text-[#F5F3EE]',
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#E9E6E0] dark:border-[#35322E]">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-lg font-semibold tracking-tight text-[#1A1917] dark:text-[#F5F3EE] leading-snug break-words">{title}</h2>
            {description && <p className="mt-1 text-xs text-[#5F5C56] dark:text-[#B9B5AD] leading-normal break-words">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#85817A] dark:text-[#807C75] hover:bg-[#F6F5F2] dark:hover:bg-[#25231F] hover:text-[#1A1917] dark:hover:text-[#F5F3EE] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4 min-w-0">{children}</div>
      </div>
    </div>
  );
}
