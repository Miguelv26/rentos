import { MetodoPago, Reserva } from '@/data/HU3_ReservasData';
import { buildReportSummary, filterTransactionsByDateRange, filterTransactionsByPaymentMethod } from '@/hooks/useReportes';

const buildReserva = (id: string, fechaInicio: string, metodoPago: MetodoPago, totalFinal: number): Reserva => ({
  id,
  vehiculoId: 1,
  cliente: 'Cliente',
  documento: '123',
  fechaInicio,
  fechaFin: fechaInicio,
  desglose: {
    dias: 1,
    precioDia: totalFinal,
    totalExtras: 0,
    deposito: Math.round(totalFinal * 0.2),
  },
  totalFinal,
  estado: 'confirmada',
  pago: {
    metodoPago,
    estado: 'procesado',
    fechaOperacion: fechaInicio,
    referencia: `TXN-${id}`,
  },
});

describe('useReportes helpers', () => {
  const reservas = [
    buildReserva('res-1', '2026-03-01', 'efectivo', 100),
    buildReserva('res-2', '2026-03-10', 'tarjeta_credito', 150),
    buildReserva('res-3', '2026-04-02', 'efectivo', 200),
  ];

  // # Esta prueba es la 1 para la HU 4.3
  it('filters transactions by date range', () => {
    const result = filterTransactionsByDateRange(reservas, '2026-03-01', '2026-03-31');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('res-1');
    expect(result[1].id).toBe('res-2');
  });

  // # Esta prueba es la 2 para la HU 4.3
  it('filters transactions by payment method', () => {
    const result = filterTransactionsByPaymentMethod(reservas, 'tarjeta_credito');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('res-2');
  });

  it('builds report summary from rows', () => {
    const summary = buildReportSummary([
      {
        id: 'res-1',
        fechaInicio: '2026-03-01',
        fechaFin: '2026-03-01',
        cliente: 'Cliente',
        documento: '123',
        vehiculoId: 1,
        totalFinal: 100,
        metodoPago: 'efectivo',
        estadoPago: 'procesado',
        estadoReserva: 'confirmada',
      },
      {
        id: 'res-2',
        fechaInicio: '2026-03-10',
        fechaFin: '2026-03-10',
        cliente: 'Cliente',
        documento: '123',
        vehiculoId: 1,
        totalFinal: 150,
        metodoPago: 'tarjeta_credito',
        estadoPago: 'procesado',
        estadoReserva: 'confirmada',
      },
    ]);

    expect(summary.reservasIncluidas).toBe(2);
    expect(summary.totalFacturado).toBe(250);
    expect(summary.paymentBreakdown).toHaveLength(2);
  });
});
