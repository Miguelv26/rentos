import { Reserva } from '@/data/HU3_ReservasData';
import { Vehiculo } from '@/data/HU1_VehiculosData';

export type TipoFiltro = Vehiculo['tipo'] | 'todos';
export type EstadoFiltro = Vehiculo['estado'] | 'todos';

export interface CalendarFilters {
  tipo: TipoFiltro;
  estado: EstadoFiltro;
}

export const filterVehiculosForCalendar = (vehiculos: Vehiculo[], filters: CalendarFilters): Vehiculo[] => {
  return vehiculos.filter((vehiculo) => {
    const matchesTipo = filters.tipo === 'todos' || vehiculo.tipo === filters.tipo;
    const matchesEstado = filters.estado === 'todos' || vehiculo.estado === filters.estado;
    return matchesTipo && matchesEstado;
  });
};

export const buildWeekDays = (anchorDate: Date = new Date()): Date[] => {
  const current = new Date(anchorDate);
  const dayOfWeek = current.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  current.setDate(current.getDate() + mondayOffset);
  current.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, idx) => {
    const day = new Date(current);
    day.setDate(current.getDate() + idx);
    return day;
  });
};

export const reservationOverlapsDay = (reserva: Reserva, day: Date): boolean => {
  if (reserva.estado === 'cancelada') {
    return false;
  }

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const start = new Date(reserva.fechaInicio).getTime();
  const end = new Date(reserva.fechaFin).getTime();

  return start <= dayEnd.getTime() && end >= dayStart.getTime();
};

export const getVehicleDayReservations = (
  reservas: Reserva[],
  vehiculoId: number,
  day: Date,
): Reserva[] => {
  return reservas.filter((reserva) => reserva.vehiculoId === vehiculoId && reservationOverlapsDay(reserva, day));
};

export const formatDayLabel = (day: Date): string => {
  return day.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: '2-digit' });
};
