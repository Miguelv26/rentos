import React from 'react';
import { ComparisonResult } from '@/hooks/analytics.utils';

interface ComparisonBadgeProps {
  comparison: ComparisonResult;
}

export const ComparisonBadge: React.FC<ComparisonBadgeProps> = ({ comparison }) => {
  const colorClass = comparison.trend === 'up'
    ? 'text-green-400'
    : comparison.trend === 'down'
      ? 'text-red-400'
      : 'text-gray-400';

  const icon = comparison.trend === 'up' ? '↑' : comparison.trend === 'down' ? '↓' : '→';

  return (
    <div className="flex items-center gap-2" aria-label="comparacion mensual">
      <span className={`text-xs font-bold ${colorClass}`}>
        {icon} {comparison.percentage.toFixed(1)}%
      </span>
      <span className="text-xs text-gray-500">vs mes anterior</span>
    </div>
  );
};
