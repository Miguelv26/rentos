import { Reserva } from '@/data/HU3_ReservasData';
import { Vehiculo } from '@/data/HU1_VehiculosData';
import { filterVehiculosForCalendar, getVehicleDayReservations } from '@/hooks/calendario.utils';

describe('calendario.utils (HU 2.2)', () => {
  // # Esta prueba es la 1 para la HU 2.2
  it('filters vehicles by type and state', () => {
    const vehiculos: Vehiculo[] = [
      { id: 1, marca: 'A', modelo: 'M1', anio: 2024, placa: 'A1', kilometraje: 1000, proximoMantenimiento: 100, estado: 'available', tipo: 'Naked', precioDia: 50, foto: 'x' },
      { id: 2, marca: 'B', modelo: 'M2', anio: 2024, placa: 'B1', kilometraje: 2000, proximoMantenimiento: 100, estado: 'rented', tipo: 'Adventure', precioDia: 60, foto: 'x' },
    ];

    const result = filterVehiculosForCalendar(vehiculos, { tipo: 'Adventure', estado: 'rented' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  // # Esta prueba es la 2 para la HU 2.2
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
