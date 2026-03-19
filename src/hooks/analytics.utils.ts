import { Reserva } from '@/data/HU3_ReservasData';
import { Vehiculo } from '@/data/HU1_VehiculosData';

export type RevenueMonth = {
  monthLabel: string;
  ingresos: number;
};

export type FleetStatusItem = {
  name: string;
  value: number;
  color: string;
};

export type ComparisonResult = {
  percentage: number;
  trend: 'up' | 'down' | 'flat';
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const calculateComparison = (currentValue: number, previousValue: number): ComparisonResult => {
  if (previousValue <= 0 && currentValue > 0) {
    return { percentage: 100, trend: 'up' };
  }

  if (previousValue <= 0) {
    return { percentage: 0, trend: 'flat' };
  }

  const delta = ((currentValue - previousValue) / previousValue) * 100;
  if (Math.abs(delta) < 0.01) {
    return { percentage: 0, trend: 'flat' };
  }

  return {
    percentage: Math.abs(delta),
    trend: delta > 0 ? 'up' : 'down',
  };
};

export const buildMonthlyRevenueData = (reservas: Reserva[], now = new Date()): RevenueMonth[] => {
  const result: RevenueMonth[] = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const ingresos = reservas
      .filter((reserva) => {
        const reservaDate = new Date(reserva.fechaInicio);
        return (
          reserva.estado !== 'cancelada' &&
          reservaDate.getFullYear() === year &&
          reservaDate.getMonth() === month
        );
      })
      .reduce((sum, reserva) => sum + reserva.totalFinal, 0);

    result.push({
      monthLabel: `${MONTH_LABELS[month]} ${String(year).slice(-2)}`,
      ingresos,
    });
  }

  return result;
};

export const buildFleetStatusData = (vehiculos: Vehiculo[]): FleetStatusItem[] => {
  return [
    {
      name: 'Disponible',
      value: vehiculos.filter((vehicle) => vehicle.estado === 'available').length,
      color: '#00C851',
    },
    {
      name: 'Rentado',
      value: vehiculos.filter((vehicle) => vehicle.estado === 'rented').length,
      color: '#00E5FF',
    },
    {
      name: 'Mantenimiento',
      value: vehiculos.filter((vehicle) => vehicle.estado === 'maintenance').length,
      color: '#FF6D00',
    },
  ];
};

export const getVehicleMaintenanceCost = (vehiculo: Vehiculo): number => {
  return (vehiculo.historial ?? []).reduce((sum, record) => sum + record.costo, 0);
};

export const estimateVehicleInvestment = (vehiculo: Vehiculo): number => {
  return vehiculo.precioDia * 300;
};

export const sumReservationRevenueForVehicle = (vehiculoId: number, reservas: Reserva[]): number => {
  return reservas
    .filter((reserva) => reserva.vehiculoId === vehiculoId && reserva.estado !== 'cancelada')
    .reduce((sum, reserva) => sum + reserva.totalFinal, 0);
};
