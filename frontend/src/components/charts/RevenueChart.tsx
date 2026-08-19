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
              <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#39FF14" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3A4552" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} fontFamily="monospace" />
          <YAxis
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            fontFamily="monospace"
            tickFormatter={(val) => `$${val / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0B0C10',
              borderColor: '#3A4552',
              borderRadius: '0px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#F1F5F9',
            }}
            formatter={(value: any) => [formatCurrency(Number(value) || 0), 'MRR']}
          />
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="#39FF14"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#mrrGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
