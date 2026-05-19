import { renderHook, act, waitFor } from '@testing-library/react';
import { useVehiculos } from '@/hooks/useVehiculos';
import { Vehiculo } from '@/data/HU1_VehiculosData';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('useVehiculos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga vehículos desde api y normaliza los campos numéricos', async () => {
    mockedApi.get.mockResolvedValueOnce([
      {
        id: '1',
        placa: 'ABC123',
        modelo: 'Honda CB500',
        marca: 'Honda',
        anio: '2023',
        estado: 'available',
        tipo: 'Naked',
        foto: '/test.jpg',
        precioDia: '50',
        kilometraje: '1000',
        proximoMantenimiento: '5000',
      },
    ] as unknown as Vehiculo[]);

    const { result } = renderHook(() => useVehiculos());

    await waitFor(() => {
      expect(result.current.vehiculos).toHaveLength(1);
    });

    expect(result.current.vehiculos[0]).toMatchObject({
      id: 1,
      anio: 2023,
      precioDia: 50,
      kilometraje: 1000,
      proximoMantenimiento: 5000,
      tipo: 'Naked',
    });
  });

  it('envía a api los valores reales al crear un vehículo', async () => {
    mockedApi.get.mockResolvedValueOnce([]);
    mockedApi.post.mockImplementation(async (_path, body) => ({
      id: 999,
      ...(body as object),
    } as Vehiculo));

    const { result } = renderHook(() => useVehiculos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockedApi.post.mockClear();

    const nuevoVehiculo: Vehiculo = {
      id: 12345,
      placa: 'XYZ789',
      modelo: 'Yamaha MT-07',
      marca: 'Yamaha',
      anio: 2024,
      estado: 'available',
      tipo: 'Adventure',
      foto: '/yamaha.jpg',
      precioDia: 60,
      kilometraje: 500,
      proximoMantenimiento: 5000,
    };

    await act(async () => {
      result.current.setVehiculos([nuevoVehiculo]);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/vehiculos', expect.objectContaining({
        tipo: 'Adventure',
        precioDia: 60,
        kilometraje: 500,
        proximoMantenimiento: 5000,
      }));
    });
  });

  it('usa el fallback mock si la api falla', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useVehiculos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.vehiculos.length).toBeGreaterThan(0);
    expect(result.current.error).toBe('network');
  });
});
