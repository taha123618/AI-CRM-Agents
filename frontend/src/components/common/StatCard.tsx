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
  iconBgColor = 'bg-[#FF2A54]/10 border-[#FF2A54]/20',
  iconColor = 'text-[#FF2A54]',
  glowClass = 'glow-card-crimson',
  loading,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'bg-[#1A1F26] border border-[#252b36] rounded-none hover:border-[#333b4d] transition-none p-5',
        glowClass,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={cn('p-2 rounded-none border transition-none', iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-28 mt-3 rounded-none" />
      ) : (
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {value}
          </div>
          {subtitle && <p className="text-xs font-mono text-slate-400 mt-1.5 flex items-center gap-1">{subtitle}</p>}
        </div>
      )}
    </Card>
  );
}

