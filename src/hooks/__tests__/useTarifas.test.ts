import { renderHook, waitFor } from '@testing-library/react';
import { useTarifas } from '@/hooks/useTarifas';

describe('useTarifas - calcularPrecioFinal', () => {
  it('aplica temporada alta cuando hay solapamiento de fechas', async () => {
    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const precio = result.current.calcularPrecioFinal(100, '2026-12-20', '2026-12-22');
    expect(precio).toBe(299);
  });

  it('aplica descuento por larga duración (>=7 días)', async () => {
    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precio = result.current.calcularPrecioFinal(100, '2026-03-01', '2026-03-08');
    expect(precio).toBe(724);
  });

  it('aplica recargo de fin de semana si incluye sabado/domingo', async () => {
    const { result } = renderHook(() => useTarifas());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const precio = result.current.calcularPrecioFinal(50, '2026-03-14', '2026-03-15');
    expect(precio).toBe(57);
  });
});
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTarifas } from '@/hooks/useTarifas';

describe('useTarifas', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('rentos_tarifas', JSON.stringify([]));
  });

  it('creates a new tariff rule', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let newTarifa: any;
    act(() => {
      newTarifa = result.current.crearTarifa({
        nombre: 'Descuento Semana',
        tipo: 'descuento_largo',
        porcentaje: -15,
        vehiculosAplicables: 'todos',
        activa: true
      });
    });

    expect(newTarifa).toBeDefined();
    expect(newTarifa?.id).toContain('tar-');
    expect(newTarifa?.nombre).toBe('Descuento Semana');
  });

  it('updates tariff information', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let tarifaId: string;
    act(() => {
      const tarifa = result.current.crearTarifa({
        nombre: 'Fin de Semana',
        tipo: 'fin_semana',
        porcentaje: 20,
        vehiculosAplicables: 'todos',
        activa: true
      });
      tarifaId = tarifa.id;
    });

    act(() => {
      result.current.actualizarTarifa(tarifaId, { porcentaje: 25 });
    });

    const updated = result.current.tarifas.find(t => t.id === tarifaId);
    expect(updated?.porcentaje).toBe(25);
  });

  it('deletes a tariff', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = result.current.tarifas.length;

    let tarifaId: string;
    act(() => {
      const tarifa = result.current.crearTarifa({
        nombre: 'Tarifa Temporal',
        tipo: 'temporada_alta',
        porcentaje: 30,
        vehiculosAplicables: 'todos',
        activa: true,
        fechaInicio: '2026-12-01',
        fechaFin: '2026-12-31'
      });
      tarifaId = tarifa.id;
    });

    expect(result.current.tarifas.length).toBe(initialCount + 1);

    act(() => {
      result.current.eliminarTarifa(tarifaId);
    });

    expect(result.current.tarifas.length).toBe(initialCount);
  });

  it('calculates final price with long rental discount', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearTarifa({
        nombre: 'Descuento 7+ días',
        tipo: 'descuento_largo',
        porcentaje: -15,
        vehiculosAplicables: 'todos',
        activa: true
      });
    });

    const precioBase = 50000;
    const precio7Dias = result.current.calcularPrecioFinal(precioBase, '2026-04-01', '2026-04-08');
    
    expect(precio7Dias).toBe(Math.round(50000 * 0.85 * 7));
  });

  it('calculates final price with weekend surcharge', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearTarifa({
        nombre: 'Recargo Fin de Semana',
        tipo: 'fin_semana',
        porcentaje: 20,
        vehiculosAplicables: 'todos',
        activa: true
      });
    });

    const precioBase = 50000;
    const precioSabado = result.current.calcularPrecioFinal(precioBase, '2026-03-22', '2026-03-24');
    
    expect(precioSabado).toBeGreaterThan(precioBase * 2);
  });

  it('calculates final price with high season surcharge', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearTarifa({
        nombre: 'Temporada Alta Diciembre',
        tipo: 'temporada_alta',
        porcentaje: 30,
        vehiculosAplicables: 'todos',
        activa: true,
        fechaInicio: '2026-12-15',
        fechaFin: '2026-12-31'
      });
    });

    const precioBase = 50000;
    const precioDiciembre = result.current.calcularPrecioFinal(precioBase, '2026-12-20', '2026-12-25');
    
    expect(precioDiciembre).toBe(Math.round(50000 * 1.30 * 5));
  });

  it('applies tariff only to specific vehicles', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearTarifa({
        nombre: 'Descuento Vehículo 1',
        tipo: 'descuento_largo',
        porcentaje: -20,
        vehiculosAplicables: [1],
        activa: true
      });
    });

    const precioBase = 50000;
    const precioVehiculo1 = result.current.calcularPrecioFinal(precioBase, '2026-04-01', '2026-04-08', 1);
    const precioVehiculo2 = result.current.calcularPrecioFinal(precioBase, '2026-04-01', '2026-04-08', 2);
    
    expect(precioVehiculo1).toBeLessThan(precioVehiculo2);
    expect(precioVehiculo1).toBe(Math.round(50000 * 0.80 * 7));
    expect(precioVehiculo2).toBe(50000 * 7);
  });

  it('ignores inactive tariffs', async () => {
    const { result } = renderHook(() => useTarifas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearTarifa({
        nombre: 'Descuento Inactivo',
        tipo: 'descuento_largo',
        porcentaje: -50,
        vehiculosAplicables: 'todos',
        activa: false
      });
    });

    const precioBase = 50000;
    const precio = result.current.calcularPrecioFinal(precioBase, '2026-04-01', '2026-04-08');
    
    expect(precio).toBe(50000 * 7);
  });
});
