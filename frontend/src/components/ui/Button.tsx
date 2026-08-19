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
        'bg-[#FF2A54] hover:bg-[#e11d48] text-white border border-[#FF2A54]/50 focus:outline-none focus:ring-1 focus:ring-[#FF2A54] focus:shadow-[0_0_15px_rgba(255,42,84,0.4)]',
      secondary:
        'bg-[#1A1F26] hover:bg-[#252b36] text-white border border-[#252b36] focus:outline-none focus:border-slate-500',
      outline:
        'bg-transparent hover:bg-[#1A1F26] text-slate-200 border border-[#252b36] hover:border-slate-600 focus:outline-none focus:border-[#FF2A54]',
      ghost:
        'bg-transparent hover:bg-[#1A1F26] text-slate-300 hover:text-white focus:outline-none',
      danger:
        'bg-rose-700 hover:bg-rose-600 text-white border border-rose-600/50 focus:outline-none focus:ring-1 focus:ring-rose-500',
      orange:
        'bg-[#FF2A54] hover:bg-[#e11d48] text-white border border-[#FF2A54]/50 focus:outline-none focus:ring-1 focus:ring-[#FF2A54] focus:shadow-[0_0_15px_rgba(255,42,84,0.4)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-mono font-medium rounded-none',
      md: 'px-4 py-2 text-sm font-medium rounded-none',
      lg: 'px-5 py-2.5 text-base font-medium rounded-none',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-none transition-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
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

