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
    { name: 'High Risk (Churn Warning)', value: highRiskCount, color: '#f43f5e' },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#ffffff',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#fff' }}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
