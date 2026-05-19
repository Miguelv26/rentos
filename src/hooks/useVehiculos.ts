import { useState, useEffect } from 'react';
import { Vehiculo, HU1_VehiculosMock } from '@/data/HU1_VehiculosData';
import { api } from '@/lib/api';

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeVehiculo = (vehiculo: Vehiculo): Vehiculo => ({
  ...vehiculo,
  id: Number(vehiculo.id),
  anio: Number(vehiculo.anio),
  kilometraje: toNumber(vehiculo.kilometraje),
  proximoMantenimiento: toNumber(vehiculo.proximoMantenimiento),
  precioDia: toNumber(vehiculo.precioDia),
});

const toBackendPayload = (vehiculo: Vehiculo) => ({
  modelo: vehiculo.modelo,
  marca: vehiculo.marca,
  anio: Number(vehiculo.anio),
  placa: vehiculo.placa,
  kilometraje: Number(vehiculo.kilometraje),
  proximoMantenimiento: Number(vehiculo.proximoMantenimiento),
  estado: vehiculo.estado,
  tipo: vehiculo.tipo,
  precioDia: Number(vehiculo.precioDia),
  foto: vehiculo.foto,
});

export const useVehiculos = () => {
  const [vehiculos, setVehiculosState] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      const data = await api.get<Vehiculo[]>('/vehiculos');
      const normalizados = data.map(normalizeVehiculo);

      if (normalizados.length === 0) {
        const creados: Vehiculo[] = [];
        for (const vehiculo of HU1_VehiculosMock.slice(0, 4)) {
          const creado = await api.post<Vehiculo>('/vehiculos', toBackendPayload(vehiculo));
          creados.push(normalizeVehiculo(creado));
        }
        setVehiculosState(creados);
      } else {
        setVehiculosState(normalizados);
      }

      setError(null);
    } catch (err) {
      console.error('Error cargando vehículos desde backend:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar vehículos');
      setVehiculosState(HU1_VehiculosMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const sincronizarCambios = async (listaAnterior: Vehiculo[], nuevaLista: Vehiculo[]) => {
    const anteriores = new Map(listaAnterior.map((vehiculo) => [vehiculo.id, vehiculo]));
    const nuevos = new Map(nuevaLista.map((vehiculo) => [vehiculo.id, vehiculo]));

    for (const vehiculo of nuevaLista) {
      const anterior = anteriores.get(vehiculo.id);
      if (!anterior) {
        await api.post<Vehiculo>('/vehiculos', toBackendPayload(vehiculo));
      } else if (JSON.stringify(toBackendPayload(anterior)) !== JSON.stringify(toBackendPayload(vehiculo))) {
        await api.patch<Vehiculo>(`/vehiculos/${vehiculo.id}`, toBackendPayload(vehiculo));
      }
    }

    for (const vehiculo of listaAnterior) {
      if (!nuevos.has(vehiculo.id)) {
        await api.delete<void>(`/vehiculos/${vehiculo.id}`);
      }
    }

    await cargarVehiculos();
  };

  const setVehiculos = (nuevaLista: Vehiculo[]) => {
    const listaAnterior = vehiculos;
    const normalizados = nuevaLista.map(normalizeVehiculo);
    setVehiculosState(normalizados);

    sincronizarCambios(listaAnterior, normalizados).catch((err) => {
      console.error('Error sincronizando vehículos:', err);
      setError(err instanceof Error ? err.message : 'Error al sincronizar vehículos');
      setVehiculosState(listaAnterior);
    });
  };

  return { vehiculos, loading, error, setVehiculos, recargarVehiculos: cargarVehiculos };
};
