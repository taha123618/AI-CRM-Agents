import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  data?: { month: string; mrr: number; arr: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data || [
    { month: 'Jan', mrr: 12000, arr: 144000 },
    { month: 'Feb', mrr: 14500, arr: 174000 },
    { month: 'Mar', mrr: 19000, arr: 228000 },
    { month: 'Apr', mrr: 23500, arr: 282000 },
    { month: 'May', mrr: 28000, arr: 336000 },
    { month: 'Jun', mrr: 35000, arr: 420000 },
  ];

  return (
    <div className="h-64 w-full font-mono">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFB800" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#FFB800" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} fontFamily="monospace" />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            fontFamily="monospace"
            tickFormatter={(val) => `$${val / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: any) => [formatCurrency(Number(value) || 0), 'MRR']}
          />
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="#FFB800"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#mrrGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
