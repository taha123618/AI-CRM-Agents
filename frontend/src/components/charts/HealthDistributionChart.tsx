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
    { name: 'Low Risk (Healthy)', value: lowRiskCount, color: '#64705B' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#9A6B2F' },
    { name: 'High Risk (Warning)', value: highRiskCount, color: '#A64B45' },
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
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1917',
              borderColor: '#35332F',
              borderRadius: '0.5rem',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#5F5C56' }}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
