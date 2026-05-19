import { renderHook, act, waitFor } from '@testing-library/react';
import { useTarifas } from '@/hooks/useTarifas';
import { api } from '@/lib/api';
import { ReglaTarifa } from '@/data/TarifasData';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const buildTarifa = (overrides: Partial<ReglaTarifa> = {}): ReglaTarifa => ({
  id: 'tar-1',
  nombre: 'Descuento Semana',
  tipo: 'descuento_largo',
  porcentaje: -15,
  vehiculosAplicables: 'todos',
  activa: true,
  ...overrides,
});

describe('useTarifas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea una nueva regla tarifaria con la respuesta del backend', async () => {
    mockedApi.get.mockResolvedValueOnce([buildTarifa({ id: 'tar-base', nombre: 'Base', porcentaje: -10 })]);
    mockedApi.post.mockResolvedValueOnce(buildTarifa({ id: 'tar-100', nombre: 'Descuento Semana' }));

    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: ReglaTarifa | undefined;
    await act(async () => {
      created = await result.current.crearTarifa({
        nombre: 'Descuento Semana',
        tipo: 'descuento_largo',
        porcentaje: -15,
        vehiculosAplicables: 'todos',
        activa: true,
      });
    });

    expect(created?.id).toBe('tar-100');
    expect(result.current.tarifas.some((tarifa) => tarifa.id === 'tar-100')).toBe(true);
    expect(mockedApi.post).toHaveBeenCalledWith('/tarifas', expect.objectContaining({
      nombre: 'Descuento Semana',
      porcentaje: -15,
    }));
  });

  it('actualiza una tarifa existente', async () => {
    mockedApi.get.mockResolvedValueOnce([buildTarifa({ id: 'tar-200', porcentaje: 20, tipo: 'fin_semana' })]);
    mockedApi.patch.mockResolvedValueOnce(buildTarifa({ id: 'tar-200', porcentaje: 25, tipo: 'fin_semana' }));

    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.actualizarTarifa('tar-200', { porcentaje: 25 });
    });

    expect(result.current.tarifas.find((tarifa) => tarifa.id === 'tar-200')?.porcentaje).toBe(25);
    expect(mockedApi.patch).toHaveBeenCalledWith('/tarifas/tar-200', expect.objectContaining({ porcentaje: 25 }));
  });

  it('elimina una tarifa', async () => {
    mockedApi.get.mockResolvedValueOnce([buildTarifa({ id: 'tar-300' })]);
    mockedApi.delete.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.eliminarTarifa('tar-300');
    });

    expect(result.current.tarifas.find((tarifa) => tarifa.id === 'tar-300')).toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith('/tarifas/tar-300');
  });

  it('aplica temporada alta cuando hay solapamiento de fechas', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildTarifa({
        id: 'tar-temp',
        tipo: 'temporada_alta',
        porcentaje: 30,
        fechaInicio: '2026-12-15',
        fechaFin: '2027-01-10',
      }),
    ]);

    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precio = result.current.calcularPrecioFinal(100, '2026-12-20', '2026-12-22');
    expect(precio).toBe(260);
  });

  it('aplica descuento por larga duración (>= 7 días)', async () => {
    mockedApi.get.mockResolvedValueOnce([buildTarifa({ porcentaje: -15 })]);

    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precio = result.current.calcularPrecioFinal(100, '2026-03-01', '2026-03-08');
    expect(precio).toBe(595);
  });

  it('aplica recargo de fin de semana si la reserva toca sábado o domingo', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildTarifa({ id: 'tar-weekend', tipo: 'fin_semana', porcentaje: 20 }),
    ]);

    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precio = result.current.calcularPrecioFinal(50, '2026-03-14', '2026-03-16');
    expect(precio).toBe(120);
  });

  it('calcula precio final con recargo de temporada alta', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildTarifa({
        id: 'tar-high',
        tipo: 'temporada_alta',
        porcentaje: 30,
        fechaInicio: '2026-12-15',
        fechaFin: '2026-12-31',
      }),
    ]);

    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precioBase = 50000;
    const precioDiciembre = result.current.calcularPrecioFinal(precioBase, '2026-12-20', '2026-12-25');
    expect(precioDiciembre).toBe(Math.round(50000 * 1.3 * 5));
  });

  it('aplica tarifa solo a vehículos específicos', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildTarifa({
        id: 'tar-specific',
        porcentaje: -20,
        vehiculosAplicables: [1],
      }),
    ]);

    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precioBase = 50000;
    const precioVehiculo1 = result.current.calcularPrecioFinal(precioBase, '2026-04-01', '2026-04-08', 1);
    const precioVehiculo2 = result.current.calcularPrecioFinal(precioBase, '2026-04-01', '2026-04-08', 2);

    expect(precioVehiculo1).toBe(Math.round(50000 * 0.8 * 7));
    expect(precioVehiculo2).toBe(50000 * 7);
  });

  it('ignora tarifas inactivas', async () => {
    mockedApi.get.mockResolvedValueOnce([
      buildTarifa({
        id: 'tar-inactive',
        porcentaje: -50,
        activa: false,
      }),
    ]);

    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precioBase = 50000;
    const precio = result.current.calcularPrecioFinal(precioBase, '2026-04-01', '2026-04-08');
    expect(precio).toBe(50000 * 7);
  });
});
