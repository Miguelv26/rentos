import React from 'react';
import { Card } from '@/components/ui/Card';

interface MetricCardProps {
  title: string;
  value: string;
  helper?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, helper }) => {
  return (
    <Card>
      <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">{title}</p>
      <p className="text-3xl font-black text-white mb-2">{value}</p>
      {helper}
    </Card>
  );
};
