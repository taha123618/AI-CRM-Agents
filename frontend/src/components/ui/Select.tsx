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
      <div className="w-full space-y-1 font-mono">
        {label && (
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {label}
            {required && <span className="text-[#FF2A54] ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-[#0B0C10] text-slate-100 border border-[#3A4552] rounded-none px-3 py-1.5 text-xs focus:outline-none focus:border-[#39FF14] transition-none cursor-pointer font-mono uppercase',
            error && 'border-[#FF2A54]',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0B0C10] text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] text-[#FF2A54] font-mono uppercase">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
