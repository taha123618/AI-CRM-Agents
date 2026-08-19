import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, required, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-medium text-[#252421] dark:text-[#F5F3EE]">
            {label}
            {required && <span className="text-[#A64B45] ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-white dark:bg-[#1D1B18] text-[#1A1917] dark:text-[#F5F3EE] border border-[#DEDAD3] dark:border-[#35322E] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1917] dark:focus:ring-[#F5F3EE] focus:border-[#1A1917] dark:focus:border-[#F5F3EE] transition-all cursor-pointer',
            error && 'border-[#A64B45]',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1D1B18] text-[#1A1917] dark:text-[#F5F3EE]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#A64B45]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
