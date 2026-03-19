import React from 'react';
import { render, screen } from '@testing-library/react';
import { FleetStatusPieChart } from '@/components/analytics/FleetStatusPieChart';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }: { data: Array<{ name: string; value: number }> }) => (
    <div data-testid="pie-data">{data.map((item) => `${item.name}:${item.value}`).join('|')}</div>
  ),
  Cell: () => <div />,
  Tooltip: () => <div />,
}));

describe('FleetStatusPieChart', () => {
  it('renders pie chart with fleet status data', () => {
    render(
      <FleetStatusPieChart
        data={[
          { name: 'Disponible', value: 2, color: '#00C851' },
          { name: 'Rentado', value: 1, color: '#00E5FF' },
        ]}
      />,
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-data')).toHaveTextContent('Disponible:2|Rentado:1');
  });
});
