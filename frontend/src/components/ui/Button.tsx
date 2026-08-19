import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold uppercase tracking-wider border border-primary',
      secondary:
        'bg-card hover:bg-muted text-foreground font-mono font-bold uppercase border border-border hover:border-primary',
      outline:
        'bg-background hover:bg-muted text-foreground font-mono uppercase border border-border hover:border-primary',
      ghost:
        'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground font-mono uppercase',
      danger:
        'bg-destructive hover:bg-destructive/90 text-destructive-foreground font-mono font-bold uppercase border border-destructive',
      orange:
        'bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold uppercase border border-primary',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'px-3 py-1.5 text-xs font-mono font-medium',
      md: 'px-4 py-2 text-sm font-mono font-medium',
      lg: 'px-5 py-2.5 text-base font-mono font-medium',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
