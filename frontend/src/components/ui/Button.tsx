import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variants = {
      primary:
        'bg-[#FFB800] hover:bg-[#FFB800] text-[#0B0C10] font-mono font-bold uppercase tracking-wider border border-[#FFB800] hover:outline hover:outline-1 hover:outline-[#FFB800]',
      secondary:
        'bg-[#121212] hover:bg-[#1C1C1C] text-slate-100 font-mono font-bold uppercase border border-[#3A4552] hover:border-[#FFB800]',
      outline:
        'bg-[#0B0C10] hover:bg-[#121212] text-slate-200 font-mono uppercase border border-[#3A4552] hover:border-[#FFB800]',
      ghost:
        'bg-transparent hover:bg-[#121212] text-slate-300 hover:text-white font-mono uppercase',
      danger:
        'bg-[#FF2A54] hover:bg-[#FF2A54]/90 text-white font-mono font-bold uppercase border border-[#FF2A54]',
      orange:
        'bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#0B0C10] font-mono font-bold uppercase border border-[#FFB800]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-mono font-medium rounded-none',
      md: 'px-4 py-2 text-sm font-mono font-medium rounded-none',
      lg: 'px-5 py-2.5 text-base font-mono font-medium rounded-none',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
