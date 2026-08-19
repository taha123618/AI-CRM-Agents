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
  iconBgColor = 'bg-[#0B0C10] border-[#3A4552]',
  iconColor = 'text-[#FFB800]',
  glowClass = '',
  loading,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'bg-[#121212] border border-[#3A4552] rounded-none p-4 hover:border-[#FFB800] transition-none font-mono',
        glowClass,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">{title}</span>
        <div className={cn('p-2 rounded-none border', iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-7 w-24 mt-2" />
      ) : (
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
            {value}
          </div>
          {subtitle && <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono uppercase">{subtitle}</div>}
        </div>
      )}
    </Card>
  );
}
