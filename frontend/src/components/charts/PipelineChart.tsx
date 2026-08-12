import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PipelineMetrics } from '@/types/crm.types';
import { formatCurrency } from '@/lib/utils';

export function PipelineChart({ metrics }: { metrics?: PipelineMetrics }) {
  const data = metrics
    ? Object.entries(metrics).map(([stage, item]) => ({
        stage: stage.replace('_', ' ').toUpperCase(),
        value: item.value,
        count: item.count,
      }))
    : [
        { stage: 'PROSPECTING', value: 120000, count: 12 },
        { stage: 'QUALIFICATION', value: 85000, count: 8 },
        { stage: 'PROPOSAL', value: 64000, count: 5 },
        { stage: 'NEGOTIATION', value: 45000, count: 3 },
        { stage: 'CLOSED WON', value: 150000, count: 15 },
        { stage: 'CLOSED LOST', value: 20000, count: 2 },
      ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="stage"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            tickFormatter={(val) => `$${val / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
            }}
            formatter={(value: any) => [formatCurrency(Number(value)), 'Pipeline Value']}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
