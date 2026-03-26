import { buildWeekDays, reservationOverlapsDay, } from '@/hooks/calendario.utils';

describe('calendario.utils', () => {
  it('buildWeekDays retorna 7 dias iniciando en lunes', () => {
    const anchor = new Date('2026-03-18'); // miércoles
    const week = buildWeekDays(anchor);
    expect(week).toHaveLength(7);
    expect(week[0].getDay()).toBe(1);
    expect(week[0].toISOString().slice(0,10)).toBe('2026-03-16');
  });

  it('reservationOverlapsDay detecta solapamiento correctamente', () => {
    const reserva = { id: 'r1', vehiculoId: 1, cliente: 'X', documento: 'D', fechaInicio: '2026-03-10', fechaFin: '2026-03-15', desglose: { dias: 5, precioDia: 50, totalExtras: 0, deposito: 0 }, totalFinal: 0, estado: 'confirmada', pago: { metodoPago: 'efectivo', estado: 'procesado', fechaOperacion: '2026-03-10' } } as any;
    const day = new Date('2026-03-12');
    expect(reservationOverlapsDay(reserva, day)).toBe(true);

    const outside = new Date('2026-03-16');
    expect(reservationOverlapsDay(reserva, outside)).toBe(false);
  });

  it('getVehicleDayReservations filtra reservas del vehiculo y dia', () => {
    const reservas = [
      { id: 'r1', vehiculoId: 1, fechaInicio: '2026-03-10', fechaFin: '2026-03-12', estado: 'confirmada' } as any,
      { id: 'r2', vehiculoId: 2, fechaInicio: '2026-03-11', fechaFin: '2026-03-13', estado: 'confirmada' } as any,
    ];

    const day = new Date('2026-03-11');
    const res = getVehicleDayReservations(reservas as any, 1, day);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('r1');
  });
});
import { Reserva } from '@/data/HU3_ReservasData';
import { Vehiculo } from '@/data/HU1_VehiculosData';
import { filterVehiculosForCalendar, getVehicleDayReservations } from '@/hooks/calendario.utils';

describe('calendario.utils (HU 2.2)', () => {
  it('filters vehicles by type and state', () => {
    const vehiculos: Vehiculo[] = [
      { id: 1, marca: 'A', modelo: 'M1', anio: 2024, placa: 'A1', kilometraje: 1000, proximoMantenimiento: 100, estado: 'available', tipo: 'Naked', precioDia: 50, foto: 'x' },
      { id: 2, marca: 'B', modelo: 'M2', anio: 2024, placa: 'B1', kilometraje: 2000, proximoMantenimiento: 100, estado: 'rented', tipo: 'Adventure', precioDia: 60, foto: 'x' },
    ];

    const result = filterVehiculosForCalendar(vehiculos, { tipo: 'Adventure', estado: 'rented' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('gets day reservations for a vehicle', () => {
    const reservas: Reserva[] = [
      {
        id: 'res-1',
        vehiculoId: 2,
        cliente: 'Juan',
        documento: '123',
        fechaInicio: '2026-03-10',
        fechaFin: '2026-03-12',
        desglose: { dias: 2, precioDia: 60, totalExtras: 0, deposito: 24 },
        totalFinal: 120,
        estado: 'confirmada',
        pago: { metodoPago: 'efectivo', estado: 'procesado', fechaOperacion: '2026-03-10' },
      },
    ];

    const dayReservations = getVehicleDayReservations(reservas, 2, new Date('2026-03-11'));
    expect(dayReservations).toHaveLength(1);
    expect(dayReservations[0].cliente).toBe('Juan');
  });
});
