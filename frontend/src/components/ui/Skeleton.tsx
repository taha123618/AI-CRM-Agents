import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-none bg-[#1F2833]/80 border border-[#3A4552]/40', className)}
      {...props}
    />
  );
}
