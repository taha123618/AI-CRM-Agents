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
  iconBgColor = 'bg-brand-500/10 border-brand-500/20',
  iconColor = 'text-brand-400',
  glowClass = 'glow-card-brand',
  loading,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'hover:border-slate-700 hover:scale-[1.02] transition-all duration-300 bg-slate-900/40',
        glowClass,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={cn('p-2.5 rounded-xl border', iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-28 mt-3" />
      ) : (
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            {value}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">{subtitle}</p>}
        </div>
      )}
    </Card>
  );
}
