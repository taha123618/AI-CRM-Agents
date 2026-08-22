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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-background text-foreground border border-border rounded-none px-3 py-1.5 text-xs focus:outline-none focus:border-primary transition-none cursor-pointer font-mono uppercase',
            error && 'border-destructive',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] text-destructive font-mono uppercase">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
