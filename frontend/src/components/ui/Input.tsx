import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, required, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-slate-300">
            {label}
            {required && <span className="text-[#FF2A54] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-slate-400 pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#0D0D0D] text-white placeholder:text-slate-500 border border-[#252b36] rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF2A54] focus:border-[#FF2A54] focus:shadow-[0_0_10px_rgba(255,42,84,0.3)] transition-none',
              icon && 'pl-9',
              error && 'border-rose-500/80 focus:ring-rose-500/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

