import { renderHook, act, waitFor } from '@testing-library/react';
import { useReservas } from '@/hooks/useReservas';
import { api } from '@/lib/api';
import { Reserva } from '@/data/HU3_ReservasData';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const buildReserva = (overrides: Partial<Reserva> = {}): Reserva => ({
  id: 'res-1',
  vehiculoId: 1,
  clienteId: 'cli-1',
  cliente: 'Juan Pérez',
  documento: '123456789',
  fechaInicio: '2026-03-20',
  fechaFin: '2026-03-25',
  desglose: {
    dias: 5,
    precioDia: 50000,
    totalExtras: 0,
    deposito: 50000,
  },
  totalFinal: 250000,
  estado: 'confirmada',
  pago: {
    metodoPago: 'efectivo',
    estado: 'procesado',
    fechaOperacion: '2026-03-20',
    referencia: 'TXN-RES-1',
  },
  ...overrides,
});

const buildReservaInput = (overrides: Partial<Omit<Reserva, 'id'>> = {}) => ({
  vehiculoId: 1,
  clienteId: 'cli-1',
  cliente: 'Juan Pérez',
  documento: '123456789',
  fechaInicio: '2026-03-20',
  fechaFin: '2026-03-25',
  desglose: {
    dias: 5,
    precioDia: 50000,
    totalExtras: 0,
    deposito: 50000,
  },
  totalFinal: 250000,
  estado: 'confirmada' as const,
  ...overrides,
});

describe('useReservas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea una reserva con información de pago por defecto', async () => {
    mockedApi.get.mockResolvedValueOnce([]);
    mockedApi.post.mockResolvedValueOnce(buildReserva());

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let newReserva: Reserva | undefined;
    await act(async () => {
      newReserva = await result.current.crearReserva(buildReservaInput());
    });

    expect(newReserva?.id).toBe('res-1');
    expect(newReserva?.pago.metodoPago).toBe('efectivo');
    expect(newReserva?.pago.estado).toBe('procesado');
  });

  it('crea una reserva con método de pago personalizado', async () => {
    mockedApi.get.mockResolvedValueOnce([]);
    mockedApi.post.mockResolvedValueOnce(buildReserva({
      id: 'res-2',
      vehiculoId: 2,
      clienteId: 'cli-2',
      cliente: 'María García',
      documento: '987654321',
      pago: {
        metodoPago: 'tarjeta_credito',
        estado: 'procesado',
        fechaOperacion: '2026-03-22',
        referencia: 'TXN-CUSTOM-123',
      },
    }));

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let newReserva: Reserva | undefined;
    await act(async () => {
      newReserva = await result.current.crearReserva(buildReservaInput({
        vehiculoId: 2,
        clienteId: 'cli-2',
        cliente: 'María García',
        documento: '987654321',
        fechaInicio: '2026-03-22',
        fechaFin: '2026-03-24',
        desglose: {
          dias: 2,
          precioDia: 60000,
          totalExtras: 10000,
          deposito: 26000,
        },
        totalFinal: 130000,
        pago: {
          metodoPago: 'tarjeta_credito',
          estado: 'procesado',
          fechaOperacion: '2026-03-22',
          referencia: 'TXN-CUSTOM-123',
        },
      }));
    });

    expect(newReserva?.pago.metodoPago).toBe('tarjeta_credito');
    expect(newReserva?.pago.referencia).toBe('TXN-CUSTOM-123');
  });

  it('actualiza información de una reserva', async () => {
    mockedApi.get.mockResolvedValueOnce([buildReserva({ id: 'res-3', totalFinal: 90000 })]);
    mockedApi.patch.mockResolvedValueOnce(buildReserva({ id: 'res-3', totalFinal: 95000 }));

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.actualizarReserva('res-3', { totalFinal: 95000 });
    });

    expect(result.current.reservas.find((reserva) => reserva.id === 'res-3')?.totalFinal).toBe(95000);
  });

  it('cancela una reserva', async () => {
    mockedApi.get.mockResolvedValueOnce([buildReserva({ id: 'res-4' })]);
    mockedApi.patch.mockResolvedValueOnce(buildReserva({ id: 'res-4', estado: 'cancelada' }));

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.cancelarReserva('res-4');
    });

    expect(result.current.reservas.find((reserva) => reserva.id === 'res-4')?.estado).toBe('cancelada');
    expect(mockedApi.patch).toHaveBeenCalledWith('/reservas/res-4/cancelar');
  });

  it('finaliza una reserva', async () => {
    mockedApi.get.mockResolvedValueOnce([buildReserva({ id: 'res-5' })]);
    mockedApi.patch.mockResolvedValueOnce(buildReserva({ id: 'res-5', estado: 'finalizada' }));

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.completarReserva('res-5');
    });

    expect(result.current.reservas.find((reserva) => reserva.id === 'res-5')?.estado).toBe('finalizada');
    expect(mockedApi.patch).toHaveBeenCalledWith('/reservas/res-5/finalizar');
  });

  it('verifica disponibilidad del vehículo con solapamientos reales', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildReserva({
        id: 'res-6',
        vehiculoId: 10,
        clienteId: 'cli-10',
        fechaInicio: '2026-04-01',
        fechaFin: '2026-04-05',
      }),
    ]);

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.verificarDisponibilidad(10, '2026-04-06', '2026-04-10')).toBe(true);
    expect(result.current.verificarDisponibilidad(10, '2026-04-03', '2026-04-07')).toBe(false);
    expect(result.current.verificarDisponibilidad(10, '2026-03-28', '2026-04-02')).toBe(false);
    expect(result.current.verificarDisponibilidad(11, '2026-04-01', '2026-04-05')).toBe(true);
  });

  it('ignora reservas canceladas al verificar disponibilidad', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildReserva({
        id: 'res-7',
        vehiculoId: 20,
        estado: 'cancelada',
        fechaInicio: '2026-05-01',
        fechaFin: '2026-05-05',
      }),
    ]);

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.verificarDisponibilidad(20, '2026-05-01', '2026-05-05')).toBe(true);
  });

  it('excluye una reserva específica al verificar disponibilidad', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildReserva({
        id: 'res-8',
        vehiculoId: 30,
        fechaInicio: '2026-06-01',
        fechaFin: '2026-06-05',
      }),
    ]);

    const { result } = renderHook(() => useReservas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.verificarDisponibilidad(30, '2026-06-01', '2026-06-05', 'res-8')).toBe(true);
    expect(result.current.verificarDisponibilidad(30, '2026-06-01', '2026-06-05')).toBe(false);
  });
});
