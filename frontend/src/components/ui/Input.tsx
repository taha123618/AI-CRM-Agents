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
      <div className="w-full space-y-1 font-mono">
        {label && (
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {label}
            {required && <span className="text-[#FF2A54] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-slate-400 pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#0B0C10] text-slate-100 placeholder:text-slate-600 border border-[#3A4552] rounded-none px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#39FF14] transition-none',
              icon && 'pl-9',
              error && 'border-[#FF2A54] focus:border-[#FF2A54]',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-mono text-[#FF2A54] uppercase">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
