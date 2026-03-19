import { buildFleetStatusData, calculateComparison } from '@/hooks/analytics.utils';
import { Vehiculo } from '@/data/HU1_VehiculosData';

describe('analytics.utils', () => {
  // # Esta prueba es la 2 para la HU 4.1
  it('processes fleet status data for pie chart', () => {
    const vehiculos = [
      { id: 1, estado: 'available' },
      { id: 2, estado: 'rented' },
      { id: 3, estado: 'maintenance' },
      { id: 4, estado: 'available' },
    ] as Vehiculo[];

    const result = buildFleetStatusData(vehiculos);

    expect(result).toEqual([
      { name: 'Disponible', value: 2, color: '#00C851' },
      { name: 'Rentado', value: 1, color: '#00E5FF' },
      { name: 'Mantenimiento', value: 1, color: '#FF6D00' },
    ]);
  });

  // # Esta prueba es la 3 para la HU 4.1
  it('calculates monthly comparison percentage and trend', () => {
    const result = calculateComparison(1200, 1000);

    expect(result.trend).toBe('up');
    expect(result.percentage).toBeCloseTo(20);
  });
});
