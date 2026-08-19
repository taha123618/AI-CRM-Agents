import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#1D1B18] border border-[#E9E6E0] dark:border-[#35322E] rounded-[14px] p-5 shadow-[0_1px_2px_rgba(26,25,23,0.04)] transition-colors hover:border-[#DEDAD3] dark:hover:border-[#3F3B36]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1 pb-4 border-b border-[#E9E6E0] dark:border-[#35322E]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold tracking-tight text-[#1A1917] dark:text-[#F5F3EE] flex items-center gap-2', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-[#5F5C56] dark:text-[#B9B5AD] font-normal', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-4 text-[#5F5C56] dark:text-[#B9B5AD]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center pt-4 border-t border-[#E9E6E0] dark:border-[#35322E] text-xs text-[#85817A] dark:text-[#807C75]', className)} {...props}>
      {children}
    </div>
  );
}
