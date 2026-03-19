import { renderHook, act, waitFor } from '@testing-library/react';
import { useVehiculos } from '@/hooks/useVehiculos';
import { Vehiculo } from '@/data/HU1_VehiculosData';

describe('useVehiculos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads vehicles from localStorage if available', async () => {
    const mockVehiculos: Vehiculo[] = [
      {
        id: 1,
        placa: 'ABC123',
        modelo: 'Honda CB500',
        marca: 'Honda',
        anio: 2023,
        estado: 'available',
        tipo: 'Naked',
        foto: '/test.jpg',
        precioDia: 50,
        kilometraje: 1000,
        proximoMantenimiento: 5000
      }
    ];

    localStorage.setItem('rentos_flota', JSON.stringify(mockVehiculos));

    const { result } = renderHook(() => useVehiculos());

    await waitFor(() => {
      expect(result.current.vehiculos).toHaveLength(1);
      expect(result.current.vehiculos[0].placa).toBe('ABC123');
    });
  });

  it('saves vehicles to localStorage when updated', async () => {
    const { result } = renderHook(() => useVehiculos());

    await waitFor(() => {
      expect(result.current.vehiculos).toBeDefined();
    });

    const newVehicle: Vehiculo = {
      id: 999,
      placa: 'XYZ789',
      modelo: 'Yamaha MT-07',
      marca: 'Yamaha',
      anio: 2024,
      estado: 'available',
      tipo: 'Naked',
      foto: '/yamaha.jpg',
      precioDia: 60,
      kilometraje: 500,
      proximoMantenimiento: 5000
    };

    act(() => {
      result.current.setVehiculos([...result.current.vehiculos, newVehicle]);
    });

    const saved = localStorage.getItem('rentos_flota');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed.some((v: Vehiculo) => v.placa === 'XYZ789')).toBe(true);
  });

  it('loads mock data when localStorage is empty', async () => {
    const { result } = renderHook(() => useVehiculos());

    await waitFor(() => {
      expect(result.current.vehiculos.length).toBeGreaterThan(0);
    });
  });
});
