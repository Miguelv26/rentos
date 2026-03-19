import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { RevenueMonth } from '@/hooks/analytics.utils';

interface RevenueBarChartProps {
  data: RevenueMonth[];
  ariaLabel?: string;
}

export const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ data, ariaLabel }) => {
  return (
    <div role="img" aria-label={ariaLabel || 'Revenue chart'}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="monthLabel" stroke="#8B8FA8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#8B8FA8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #00E5FF', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => {
              const rawValue = Array.isArray(value) ? value[0] : value;
              const numericValue = typeof rawValue === 'number'
                ? rawValue
                : Number(rawValue ?? 0);

              return [`$${numericValue.toLocaleString()}`, 'Ingresos'];
            }}
          />
          <Bar dataKey="ingresos" fill="#00E5FF" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
