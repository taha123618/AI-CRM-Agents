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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-muted-foreground pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-none px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary transition-none',
              icon && 'pl-9',
              error && 'border-destructive focus:border-destructive',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-mono text-destructive uppercase">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
