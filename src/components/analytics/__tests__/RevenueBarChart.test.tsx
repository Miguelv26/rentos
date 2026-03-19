import React from 'react';
import { render, screen } from '@testing-library/react';
import { RevenueBarChart } from '@/components/analytics/RevenueBarChart';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ data }: { data: Array<{ monthLabel: string; ingresos: number }> }) => (
    <div data-testid="bar-chart">{data.map((item) => item.monthLabel).join(',')}</div>
  ),
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Bar: () => <div />,
}));

describe('RevenueBarChart', () => {
  // # Esta prueba es la 1 para la HU 4.1
  it('renders chart component with monthly labels', () => {
    render(
      <RevenueBarChart
        data={[
          { monthLabel: 'Ene 26', ingresos: 1000 },
          { monthLabel: 'Feb 26', ingresos: 1400 },
        ]}
      />,
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toHaveTextContent('Ene 26,Feb 26');
  });
});
