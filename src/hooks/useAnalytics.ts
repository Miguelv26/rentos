import { useMemo } from 'react';
import { useVehiculos } from './useVehiculos';
import { useReservas } from './useReservas';
import { useClientes } from './useClientes';
import {
  buildFleetStatusData,
  buildMonthlyRevenueData,
  calculateComparison,
  estimateVehicleInvestment,
  getVehicleMaintenanceCost,
  sumReservationRevenueForVehicle,
} from './analytics.utils';

export const useAnalytics = () => {
  const { vehiculos } = useVehiculos();
  const { reservas } = useReservas();
  const { clientes } = useClientes();

  return useMemo(() => {
    const monthlyRevenue = buildMonthlyRevenueData(reservas);
    const currentMonth = monthlyRevenue[monthlyRevenue.length - 1]?.ingresos ?? 0;
    const previousMonth = monthlyRevenue[monthlyRevenue.length - 2]?.ingresos ?? 0;
    const comparison = calculateComparison(currentMonth, previousMonth);

    const fleetStatus = buildFleetStatusData(vehiculos);

    const topRentables = vehiculos
      .map((vehiculo) => {
        const ingresos = sumReservationRevenueForVehicle(vehiculo.id, reservas);
        const costoMantenimiento = getVehicleMaintenanceCost(vehiculo);
        const ganancia = ingresos - costoMantenimiento;

        return {
          vehiculo,
          ingresos,
          costoMantenimiento,
          ganancia,
          alquileres: reservas.filter((reserva) => reserva.vehiculoId === vehiculo.id && reserva.estado !== 'cancelada').length,
        };
      })
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 5);

    const ingresosTotales = reservas
      .filter((reserva) => reserva.estado !== 'cancelada')
      .reduce((sum, reserva) => sum + reserva.totalFinal, 0);

    const costosMantenimiento = vehiculos
      .reduce((sum, vehiculo) => sum + getVehicleMaintenanceCost(vehiculo), 0);

    const inversionEstimada = vehiculos
      .reduce((sum, vehiculo) => sum + estimateVehicleInvestment(vehiculo), 0);

    const roiEstimado = inversionEstimada > 0
      ? ((ingresosTotales - costosMantenimiento) / inversionEstimada) * 100
      : 0;

    const tasaOcupacion = vehiculos.length > 0
      ? (fleetStatus.find((item) => item.name === 'Rentado')?.value ?? 0) / vehiculos.length * 100
      : 0;

    if (!reservas.length) {
      const fallbackRevenue = monthlyRevenue.map((item, index) => ({
        ...item,
        ingresos: item.ingresos || vehiculos.reduce((sum, vehiculo) => sum + vehiculo.precioDia, 0) * (index + 1),
      }));

      return {
        monthlyRevenue: fallbackRevenue,
        fleetStatus,
        comparison,
        topRentables,
        ingresosMesActual: fallbackRevenue[fallbackRevenue.length - 1]?.ingresos ?? 0,
        ingresosMesAnterior: fallbackRevenue[fallbackRevenue.length - 2]?.ingresos ?? 0,
        roiEstimado,
        tasaOcupacion,
        flotaTotal: vehiculos.length,
        clientesTotales: clientes.length,
      };
    }

    return {
      monthlyRevenue,
      fleetStatus,
      comparison,
      topRentables,
      ingresosMesActual: currentMonth,
      ingresosMesAnterior: previousMonth,
      roiEstimado,
      tasaOcupacion,
      flotaTotal: vehiculos.length,
      clientesTotales: clientes.length,
    };
  }, [vehiculos, reservas, clientes]);
};
