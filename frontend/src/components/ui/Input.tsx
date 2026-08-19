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
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-medium text-[#252421] dark:text-[#F5F3EE]">
            {label}
            {required && <span className="text-[#A64B45] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-[#85817A] dark:text-[#807C75] pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white dark:bg-[#1D1B18] text-[#1A1917] dark:text-[#F5F3EE] placeholder:text-[#85817A] dark:placeholder:text-[#807C75] border border-[#DEDAD3] dark:border-[#35322E] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1917] dark:focus:ring-[#F5F3EE] focus:border-[#1A1917] dark:focus:border-[#F5F3EE] transition-all',
              icon && 'pl-9',
              error && 'border-[#A64B45] focus:ring-[#A64B45] focus:border-[#A64B45]',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#A64B45]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
