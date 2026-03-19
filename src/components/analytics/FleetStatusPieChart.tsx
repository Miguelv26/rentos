import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FleetStatusItem } from '@/hooks/analytics.utils';

interface FleetStatusPieChartProps {
  data: FleetStatusItem[];
  ariaLabel?: string;
}

export const FleetStatusPieChart: React.FC<FleetStatusPieChartProps> = ({ data, ariaLabel }) => {
  return (
    <div role="img" aria-label={ariaLabel || 'Fleet status chart'}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`status-${entry.name}-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #00E5FF', borderRadius: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
