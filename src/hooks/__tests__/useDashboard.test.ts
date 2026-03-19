import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from '@/hooks/useDashboard';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useReservas } from '@/hooks/useReservas';
import { useClientes } from '@/hooks/useClientes';

jest.mock('@/hooks/useVehiculos');
jest.mock('@/hooks/useReservas');
jest.mock('@/hooks/useClientes');

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates current month income correctly', () => {
    const mockVehiculos = [
      { id: 1, estado: 'available' },
      { id: 2, estado: 'rented' }
    ];

    const mockReservas = [
      {
        id: 'res-1',
        vehiculoId: 1,
        fechaInicio: '2026-03-15',
        fechaFin: '2026-03-17',
        totalFinal: 100000,
        estado: 'confirmada'
      },
      {
        id: 'res-2',
        vehiculoId: 2,
        fechaInicio: '2026-03-18',
        fechaFin: '2026-03-20',
        totalFinal: 150000,
        estado: 'confirmada'
      }
    ];

    const mockClientes = [
      { id: 'cli-1', nombre: 'Cliente 1' },
      { id: 'cli-2', nombre: 'Cliente 2' }
    ];

    (useVehiculos as jest.Mock).mockReturnValue({ vehiculos: mockVehiculos });
    (useReservas as jest.Mock).mockReturnValue({ reservas: mockReservas });
    (useClientes as jest.Mock).mockReturnValue({ clientes: mockClientes });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.ingresosMesActual).toBe(250000);
  });

  it('calculates fleet status correctly', () => {
    const mockVehiculos = [
      { id: 1, estado: 'available' },
      { id: 2, estado: 'available' },
      { id: 3, estado: 'rented' },
      { id: 4, estado: 'maintenance' }
    ];

    (useVehiculos as jest.Mock).mockReturnValue({ vehiculos: mockVehiculos });
    (useReservas as jest.Mock).mockReturnValue({ reservas: [] });
    (useClientes as jest.Mock).mockReturnValue({ clientes: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.flotaTotal).toBe(4);
    expect(result.current.disponibles).toBe(2);
    expect(result.current.alquilados).toBe(1);
    expect(result.current.enTaller).toBe(1);
  });

  it('calculates occupation rate correctly', () => {
    const mockVehiculos = [
      { id: 1, estado: 'available' },
      { id: 2, estado: 'rented' },
      { id: 3, estado: 'rented' },
      { id: 4, estado: 'maintenance' }
    ];

    (useVehiculos as jest.Mock).mockReturnValue({ vehiculos: mockVehiculos });
    (useReservas as jest.Mock).mockReturnValue({ reservas: [] });
    (useClientes as jest.Mock).mockReturnValue({ clientes: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.tasaOcupacion).toBe(50);
  });

  it('excludes cancelled reservations from income', () => {
    const mockReservas = [
      {
        id: 'res-1',
        vehiculoId: 1,
        fechaInicio: '2026-03-15',
        fechaFin: '2026-03-17',
        totalFinal: 100000,
        estado: 'confirmada'
      },
      {
        id: 'res-2',
        vehiculoId: 2,
        fechaInicio: '2026-03-16',
        fechaFin: '2026-03-18',
        totalFinal: 200000,
        estado: 'cancelada'
      }
    ];

    (useVehiculos as jest.Mock).mockReturnValue({ vehiculos: [] });
    (useReservas as jest.Mock).mockReturnValue({ reservas: mockReservas });
    (useClientes as jest.Mock).mockReturnValue({ clientes: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.ingresosMesActual).toBe(100000);
  });

  it('identifies top rented vehicles', () => {
    const mockVehiculos = [
      { id: 1, modelo: 'Honda CB500', placa: 'ABC123' },
      { id: 2, modelo: 'Yamaha MT-07', placa: 'XYZ789' }
    ];

    const mockReservas = [
      { id: 'res-1', vehiculoId: 1, estado: 'confirmada', fechaInicio: '2026-03-01' },
      { id: 'res-2', vehiculoId: 1, estado: 'confirmada', fechaInicio: '2026-03-05' },
      { id: 'res-3', vehiculoId: 1, estado: 'confirmada', fechaInicio: '2026-03-10' },
      { id: 'res-4', vehiculoId: 2, estado: 'confirmada', fechaInicio: '2026-03-12' }
    ];

    (useVehiculos as jest.Mock).mockReturnValue({ vehiculos: mockVehiculos });
    (useReservas as jest.Mock).mockReturnValue({ reservas: mockReservas });
    (useClientes as jest.Mock).mockReturnValue({ clientes: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.topVehiculos).toHaveLength(2);
    expect(result.current.topVehiculos[0].alquileres).toBe(3);
    expect(result.current.topVehiculos[0].vehiculo?.id).toBe(1);
  });

  it('returns latest 5 reservations', () => {
    const mockReservas = Array.from({ length: 10 }, (_, i) => ({
      id: `res-${i}`,
      vehiculoId: 1,
      cliente: `Cliente ${i}`,
      fechaInicio: `2026-03-${String(i + 1).padStart(2, '0')}`,
      fechaFin: `2026-03-${String(i + 2).padStart(2, '0')}`,
      totalFinal: 100000,
      estado: 'confirmada' as const
    }));

    (useVehiculos as jest.Mock).mockReturnValue({ vehiculos: [] });
    (useReservas as jest.Mock).mockReturnValue({ reservas: mockReservas });
    (useClientes as jest.Mock).mockReturnValue({ clientes: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.ultimasReservas).toHaveLength(5);
    expect(result.current.ultimasReservas[0].id).toBe('res-9');
  });

  it('generates weekly income data', () => {
    const mockReservas = [
      {
        id: 'res-1',
        vehiculoId: 1,
        fechaInicio: '2026-03-15',
        fechaFin: '2026-03-17',
        totalFinal: 100000,
        estado: 'confirmada'
      }
    ];

    (useVehiculos as jest.Mock).mockReturnValue({ vehiculos: [] });
    (useReservas as jest.Mock).mockReturnValue({ reservas: mockReservas });
    (useClientes as jest.Mock).mockReturnValue({ clientes: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.ingresosPorSemana).toHaveLength(8);
    expect(result.current.ingresosPorSemana[0].semana).toBe('S1');
  });
});
