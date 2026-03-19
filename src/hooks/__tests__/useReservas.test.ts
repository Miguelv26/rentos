import { renderHook, act, waitFor } from '@testing-library/react';
import { useReservas } from '@/hooks/useReservas';

describe('useReservas', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a new reservation with payment info', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let newReserva: any;
    act(() => {
      newReserva = result.current.crearReserva({
        vehiculoId: 1,
        cliente: 'Juan Pérez',
        documento: '123456789',
        fechaInicio: '2026-03-20',
        fechaFin: '2026-03-25',
        desglose: {
          dias: 5,
          precioDia: 50000,
          totalExtras: 0
        },
        totalFinal: 250000,
        estado: 'confirmada'
      });
    });

    expect(newReserva).toBeDefined();
    expect(newReserva?.id).toContain('res-');
    expect(newReserva?.pago).toBeDefined();
    expect(newReserva?.pago.metodoPago).toBe('efectivo');
    expect(newReserva?.pago.estado).toBe('procesado');
  });

  it('creates reservation with custom payment method', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let newReserva: any;
    act(() => {
      newReserva = result.current.crearReserva({
        vehiculoId: 2,
        cliente: 'María García',
        documento: '987654321',
        fechaInicio: '2026-03-22',
        fechaFin: '2026-03-24',
        desglose: {
          dias: 2,
          precioDia: 60000,
          totalExtras: 10000
        },
        totalFinal: 130000,
        estado: 'confirmada',
        pago: {
          metodoPago: 'tarjeta_credito',
          estado: 'procesado',
          fechaOperacion: '2026-03-22',
          referencia: 'TXN-CUSTOM-123'
        }
      });
    });

    expect(newReserva?.pago.metodoPago).toBe('tarjeta_credito');
    expect(newReserva?.pago.referencia).toBe('TXN-CUSTOM-123');
  });

  it('updates reservation information', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let reservaId: string;
    act(() => {
      const reserva = result.current.crearReserva({
        vehiculoId: 3,
        cliente: 'Carlos López',
        documento: '555555555',
        fechaInicio: '2026-03-25',
        fechaFin: '2026-03-27',
        desglose: {
          dias: 2,
          precioDia: 45000,
          totalExtras: 0
        },
        totalFinal: 90000,
        estado: 'confirmada'
      });
      reservaId = reserva.id;
    });

    act(() => {
      result.current.actualizarReserva(reservaId, { totalFinal: 95000 });
    });

    const updated = result.current.reservas.find(r => r.id === reservaId);
    expect(updated?.totalFinal).toBe(95000);
  });

  it('cancels a reservation', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let reservaId: string;
    act(() => {
      const reserva = result.current.crearReserva({
        vehiculoId: 4,
        cliente: 'Ana Martínez',
        documento: '777777777',
        fechaInicio: '2026-03-28',
        fechaFin: '2026-03-30',
        desglose: {
          dias: 2,
          precioDia: 55000,
          totalExtras: 5000
        },
        totalFinal: 115000,
        estado: 'confirmada'
      });
      reservaId = reserva.id;
    });

    act(() => {
      result.current.cancelarReserva(reservaId);
    });

    const cancelled = result.current.reservas.find(r => r.id === reservaId);
    expect(cancelled?.estado).toBe('cancelada');
  });

  it('completes a reservation', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let reservaId: string;
    act(() => {
      const reserva = result.current.crearReserva({
        vehiculoId: 5,
        cliente: 'Pedro Sánchez',
        documento: '888888888',
        fechaInicio: '2026-03-15',
        fechaFin: '2026-03-17',
        desglose: {
          dias: 2,
          precioDia: 50000,
          totalExtras: 0
        },
        totalFinal: 100000,
        estado: 'confirmada'
      });
      reservaId = reserva.id;
    });

    act(() => {
      result.current.completarReserva(reservaId);
    });

    const completed = result.current.reservas.find(r => r.id === reservaId);
    expect(completed?.estado).toBe('finalizada');
  });

  it('verifies vehicle availability correctly', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearReserva({
        vehiculoId: 10,
        cliente: 'Cliente Uno',
        documento: '111111111',
        fechaInicio: '2026-04-01',
        fechaFin: '2026-04-05',
        desglose: {
          dias: 4,
          precioDia: 50000,
          totalExtras: 0
        },
        totalFinal: 200000,
        estado: 'confirmada'
      });
    });

    const disponible1 = result.current.verificarDisponibilidad(10, '2026-04-06', '2026-04-10');
    expect(disponible1).toBe(true);

    const disponible2 = result.current.verificarDisponibilidad(10, '2026-04-03', '2026-04-07');
    expect(disponible2).toBe(false);

    const disponible3 = result.current.verificarDisponibilidad(10, '2026-03-28', '2026-04-02');
    expect(disponible3).toBe(false);

    const disponible4 = result.current.verificarDisponibilidad(11, '2026-04-01', '2026-04-05');
    expect(disponible4).toBe(true);
  });

  it('ignores cancelled reservations when checking availability', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let reservaId: string;
    act(() => {
      const reserva = result.current.crearReserva({
        vehiculoId: 20,
        cliente: 'Cliente Test',
        documento: '999999999',
        fechaInicio: '2026-05-01',
        fechaFin: '2026-05-05',
        desglose: {
          dias: 4,
          precioDia: 50000,
          totalExtras: 0
        },
        totalFinal: 200000,
        estado: 'confirmada'
      });
      reservaId = reserva.id;
    });

    act(() => {
      result.current.cancelarReserva(reservaId);
    });

    const disponible = result.current.verificarDisponibilidad(20, '2026-05-01', '2026-05-05');
    expect(disponible).toBe(true);
  });

  it('excludes specific reservation when checking availability', async () => {
    const { result } = renderHook(() => useReservas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let reservaId: string = '';
    act(() => {
      const reserva = result.current.crearReserva({
        vehiculoId: 30,
        cliente: 'Cliente Exclusión',
        documento: '333333333',
        fechaInicio: '2026-06-01',
        fechaFin: '2026-06-05',
        desglose: {
          dias: 4,
          precioDia: 50000,
          totalExtras: 0
        },
        totalFinal: 200000,
        estado: 'confirmada'
      });
      reservaId = reserva.id;
    });

    const disponible = result.current.verificarDisponibilidad(30, '2026-06-01', '2026-06-05', reservaId);
    expect(disponible).toBe(true);
  });
});
