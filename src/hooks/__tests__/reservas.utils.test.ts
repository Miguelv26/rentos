import { Cliente } from '@/data/ClientesData';
import { Reserva } from '@/data/HU3_ReservasData';
import {
  calculateReservationAmounts,
  hasReservationOverlap,
  isLicenseValidForDate,
} from '@/hooks/reservas.utils';

describe('reservas.utils (HU 2.1)', () => {
  // # Esta prueba es la 1 para la HU 2.1
  it('prevents overbooking on overlapping dates', () => {
    const reservas: Reserva[] = [
      {
        id: 'res-1',
        vehiculoId: 10,
        cliente: 'Cliente A',
        documento: '111',
        fechaInicio: '2026-03-10',
        fechaFin: '2026-03-12',
        desglose: { dias: 2, precioDia: 50, totalExtras: 10, deposito: 22 },
        totalFinal: 110,
        estado: 'confirmada',
        pago: {
          metodoPago: 'efectivo',
          estado: 'procesado',
          fechaOperacion: '2026-03-10',
          referencia: 'TXN-1',
        },
      },
    ];

    const conflict = hasReservationOverlap(reservas, 10, '2026-03-11', '2026-03-13');
    expect(conflict).toBe(true);
  });

  // # Esta prueba es la 2 para la HU 2.1
  it('calculates total and deposit automatically', () => {
    const result = calculateReservationAmounts(100, 3, 50);

    expect(result.subtotalRenta).toBe(300);
    expect(result.total).toBe(350);
    expect(result.deposito).toBe(70);
  });

  // # Esta prueba es la 3 para la HU 2.1
  it('validates client license expiry by reservation date', () => {
    const cliente: Cliente = {
      id: 'cli-1',
      nombre: 'Cliente Prueba',
      tipoDocumento: 'CC',
      numeroDocumento: '123',
      telefono: '300',
      email: 'test@test.com',
      fechaNacimiento: '1990-01-01',
      licencia: {
        numero: 'LIC-1',
        categoria: 'A2',
        fechaVencimiento: '2026-03-05',
      },
      direccion: 'Test',
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: 100,
    };

    expect(isLicenseValidForDate(cliente, '2026-03-04')).toBe(true);
    expect(isLicenseValidForDate(cliente, '2026-03-10')).toBe(false);
  });
});
