import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  glowClass?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-[#FAF9F6] dark:bg-[#25231F] border-[#E9E6E0] dark:border-[#35322E]',
  iconColor = 'text-[#1A1917] dark:text-[#F5F3EE]',
  loading,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'transition-colors bg-white dark:bg-[#1D1B18] border-[#E9E6E0] dark:border-[#35322E] hover:border-[#DEDAD3] dark:hover:border-[#3F3B36]',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#85817A] dark:text-[#807C75]">{title}</span>
        <div className={cn('p-2 rounded-xl border', iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-28 mt-3" />
      ) : (
        <div className="mt-3">
          <div className="text-2xl font-bold text-[#1A1917] dark:text-[#F5F3EE] tracking-tight font-mono">
            {value}
          </div>
          {subtitle && <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-1.5 flex items-center gap-1">{subtitle}</p>}
        </div>
      )}
    </Card>
  );
}
