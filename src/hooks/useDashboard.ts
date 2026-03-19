import { useMemo } from 'react';
import { useVehiculos } from './useVehiculos';
import { useReservas } from './useReservas';
import { useClientes } from './useClientes';

export const useDashboard = () => {
  const { vehiculos } = useVehiculos();
  const { reservas } = useReservas();
  const { clientes } = useClientes();

  const metricas = useMemo(() => {
    const hoy = new Date();
    const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    // Ingresos del mes actual
    const ingresosMesActual = reservas
      .filter(r => {
        const fecha = new Date(r.fechaInicio);
        return fecha >= inicioMesActual && r.estado !== 'cancelada';
      })
      .reduce((sum, r) => sum + r.totalFinal, 0);

    // Ingresos del mes anterior
    const ingresosMesAnterior = reservas
      .filter(r => {
        const fecha = new Date(r.fechaInicio);
        return fecha >= inicioMesAnterior && fecha <= finMesAnterior && r.estado !== 'cancelada';
      })
      .reduce((sum, r) => sum + r.totalFinal, 0);

    // Calcular cambio porcentual
    const cambioIngresos = ingresosMesAnterior > 0
      ? ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100
      : 0;

    // Estado de la flota
    const flotaTotal = vehiculos.length;
    const disponibles = vehiculos.filter(v => v.estado === 'available').length;
    const enTaller = vehiculos.filter(v => v.estado === 'maintenance').length;
    const alquilados = vehiculos.filter(v => v.estado === 'rented').length;

    // Reservas activas hoy
    const reservasActivasHoy = reservas.filter(r => {
      const inicio = new Date(r.fechaInicio);
      const fin = new Date(r.fechaFin);
      return hoy >= inicio && hoy <= fin && r.estado === 'confirmada';
    }).length;

    // Tasa de ocupación
    const tasaOcupacion = flotaTotal > 0 ? (alquilados / flotaTotal) * 100 : 0;

    // Top 5 vehículos más rentados
    const conteoVehiculos = reservas
      .filter(r => r.estado !== 'cancelada')
      .reduce((acc, r) => {
        acc[r.vehiculoId] = (acc[r.vehiculoId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    const topVehiculos = Object.entries(conteoVehiculos)
      .map(([id, count]) => ({
        vehiculo: vehiculos.find(v => v.id === Number(id)),
        alquileres: count
      }))
      .filter(item => item.vehiculo)
      .sort((a, b) => b.alquileres - a.alquileres)
      .slice(0, 5);

    // Últimas 5 reservas
    const ultimasReservas = [...reservas]
      .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
      .slice(0, 5);

    // Ingresos por semana (últimas 8 semanas)
    const ingresosPorSemana = [];
    for (let i = 7; i >= 0; i--) {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - (i * 7));
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);

      const ingresos = reservas
        .filter(r => {
          const fecha = new Date(r.fechaInicio);
          return fecha >= inicioSemana && fecha <= finSemana && r.estado !== 'cancelada';
        })
        .reduce((sum, r) => sum + r.totalFinal, 0);

      ingresosPorSemana.push({
        semana: `S${8 - i}`,
        ingresos
      });
    }

    return {
      ingresosMesActual,
      cambioIngresos,
      flotaTotal,
      disponibles,
      enTaller,
      alquilados,
      reservasActivasHoy,
      clientesTotales: clientes.length,
      tasaOcupacion,
      topVehiculos,
      ultimasReservas,
      ingresosPorSemana
    };
  }, [vehiculos, reservas, clientes]);

  return metricas;
};
