import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface HealthDistributionProps {
  lowRiskCount?: number;
  mediumRiskCount?: number;
  highRiskCount?: number;
}

export function HealthDistributionChart({
  lowRiskCount = 18,
  mediumRiskCount = 5,
  highRiskCount = 2,
}: HealthDistributionProps) {
  const data = [
    { name: 'Low Risk (Healthy)', value: lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk (Churn Warning)', value: highRiskCount, color: '#FF2A54' },
  ];

  return (
    <div className="w-full h-64 font-mono">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#1A1F26" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1F26',
              borderColor: '#252b36',
              borderRadius: '0px',
              color: '#ffffff',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

