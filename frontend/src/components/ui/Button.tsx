import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variants = {
      primary:
        'bg-[#1A1917] dark:bg-[#F5F3EE] hover:bg-[#35332F] dark:hover:bg-[#EAE8E3] text-white dark:text-[#141311] border border-[#1A1917] dark:border-[#F5F3EE] shadow-sm',
      secondary:
        'bg-white dark:bg-[#25231F] hover:bg-[#F6F5F2] dark:hover:bg-[#302D28] text-[#1A1917] dark:text-[#F5F3EE] border border-[#DEDAD3] dark:border-[#35322E] shadow-sm',
      accent:
        'bg-[#C7A66A] hover:bg-[#B8955A] text-[#1A1917] font-semibold shadow-sm',
      outline:
        'bg-transparent hover:bg-[#F6F5F2] dark:hover:bg-[#25231F] text-[#1A1917] dark:text-[#F5F3EE] border border-[#DEDAD3] dark:border-[#35322E]',
      ghost:
        'bg-transparent hover:bg-[#F1F0EC] dark:hover:bg-[#25231F] text-[#5F5C56] dark:text-[#B9B5AD] hover:text-[#1A1917] dark:hover:text-[#F5F3EE]',
      danger:
        'bg-[#A64B45] hover:bg-[#8E3E39] text-white border border-[#A64B45] shadow-sm',
      orange:
        'bg-[#1A1917] dark:bg-[#F5F3EE] hover:bg-[#35332F] dark:hover:bg-[#EAE8E3] text-white dark:text-[#141311] border border-[#1A1917] dark:border-[#F5F3EE] shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
      md: 'px-4 py-2 text-sm font-medium rounded-xl',
      lg: 'px-5 py-2.5 text-base font-medium rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-colors duration-150 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
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
