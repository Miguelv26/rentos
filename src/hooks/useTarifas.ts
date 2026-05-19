import { useState, useEffect } from 'react';
import { ReglaTarifa, TarifasMock } from '@/data/TarifasData';
import { api } from '@/lib/api';

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeTarifa = (tarifa: ReglaTarifa): ReglaTarifa => ({
  ...tarifa,
  porcentaje: toNumber(tarifa.porcentaje),
  vehiculosAplicables: tarifa.vehiculosAplicables ?? 'todos',
  activa: tarifa.activa ?? true,
});

const toBackendPayload = (tarifa: Omit<ReglaTarifa, 'id'> | Partial<ReglaTarifa>) => ({
  nombre: tarifa.nombre,
  tipo: tarifa.tipo,
  porcentaje: tarifa.porcentaje === undefined ? undefined : Number(tarifa.porcentaje),
  vehiculosAplicables: tarifa.vehiculosAplicables ?? 'todos',
  activa: tarifa.activa,
  fechaInicio: tarifa.fechaInicio || undefined,
  fechaFin: tarifa.fechaFin || undefined,
});

export const useTarifas = () => {
  const [tarifas, setTarifas] = useState<ReglaTarifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTarifas = async () => {
    try {
      setLoading(true);
      const data = await api.get<ReglaTarifa[]>('/tarifas');
      const normalizadas = data.map(normalizeTarifa);

      if (normalizadas.length === 0) {
        const creadas: ReglaTarifa[] = [];
        for (const tarifa of TarifasMock) {
          const creada = await api.post<ReglaTarifa>('/tarifas', toBackendPayload(tarifa));
          creadas.push(normalizeTarifa(creada));
        }
        setTarifas(creadas);
      } else {
        setTarifas(normalizadas);
      }

      setError(null);
    } catch (err) {
      console.error('Error cargando tarifas desde backend:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar tarifas');
      setTarifas(TarifasMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTarifas();
  }, []);

  const crearTarifa = async (tarifa: Omit<ReglaTarifa, 'id'>) => {
    const temporal: ReglaTarifa = { ...tarifa, id: `tmp-${Date.now()}` };
    setTarifas((prev) => [temporal, ...prev]);

    try {
      const creada = await api.post<ReglaTarifa>('/tarifas', toBackendPayload(tarifa));
      const normalizada = normalizeTarifa(creada);
      setTarifas((prev) => [normalizada, ...prev.filter((t) => t.id !== temporal.id)]);
      return normalizada;
    } catch (err) {
      setTarifas((prev) => prev.filter((t) => t.id !== temporal.id));
      setError(err instanceof Error ? err.message : 'Error al crear tarifa');
      throw err;
    }
  };

  const actualizarTarifa = async (id: string, cambios: Partial<ReglaTarifa>) => {
    const anteriores = tarifas;
    setTarifas(tarifas.map((t) => t.id === id ? { ...t, ...cambios } : t));

    try {
      const actualizada = await api.patch<ReglaTarifa>(`/tarifas/${id}`, toBackendPayload(cambios));
      setTarifas((prev) => prev.map((t) => t.id === id ? normalizeTarifa(actualizada) : t));
    } catch (err) {
      setTarifas(anteriores);
      setError(err instanceof Error ? err.message : 'Error al actualizar tarifa');
      throw err;
    }
  };

  const eliminarTarifa = async (id: string) => {
    const anteriores = tarifas;
    setTarifas(tarifas.filter((t) => t.id !== id));

    try {
      await api.delete<void>(`/tarifas/${id}`);
    } catch (err) {
      setTarifas(anteriores);
      setError(err instanceof Error ? err.message : 'Error al eliminar tarifa');
      throw err;
    }
  };

  const calcularPrecioFinal = (precioBase: number, fechaInicio: string, fechaFin: string, vehiculoId?: number): number => {
    let precioFinal = precioBase;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    tarifas.filter((t) => t.activa).forEach((tarifa) => {
      if (tarifa.vehiculosAplicables !== 'todos' && vehiculoId && !tarifa.vehiculosAplicables.includes(vehiculoId)) return;

      if (tarifa.tipo === 'descuento_largo' && dias >= 7) {
        precioFinal = precioFinal * (1 + tarifa.porcentaje / 100);
      } else if (tarifa.tipo === 'fin_semana') {
        const esFinde = inicio.getDay() === 6 || inicio.getDay() === 0 || fin.getDay() === 6 || fin.getDay() === 0;
        if (esFinde) precioFinal = precioFinal * (1 + tarifa.porcentaje / 100);
      } else if (tarifa.tipo === 'temporada_alta' && tarifa.fechaInicio && tarifa.fechaFin) {
        const inicioTemp = new Date(tarifa.fechaInicio);
        const finTemp = new Date(tarifa.fechaFin);
        if (inicio <= finTemp && fin >= inicioTemp) precioFinal = precioFinal * (1 + tarifa.porcentaje / 100);
      }
    });

    return Math.round(precioFinal * dias);
  };

  const calcularPrecioFinalBackend = async (precioBase: number, fechaInicio: string, fechaFin: string, vehiculoId?: number) => {
    return api.post<{ precioFinal: number; tarifasAplicadas: unknown[] }>('/tarifas/calcular-precio', {
      precioBase,
      fechaInicio,
      fechaFin,
      vehiculoId,
    });
  };

  return {
    tarifas,
    loading,
    error,
    crearTarifa,
    actualizarTarifa,
    eliminarTarifa,
    calcularPrecioFinal,
    calcularPrecioFinalBackend,
    recargarTarifas: cargarTarifas,
  };
};
