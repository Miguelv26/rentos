import { useState, useEffect } from 'react';

export interface OrdenMantenimiento {
  id: string;
  vehiculoId: number;
  tipo: 'preventivo' | 'correctivo';
  descripcion: string;
  fechaInicio: string;
  fechaEstimadaFin: string;
  fechaFinReal?: string;
  costo: number;
  estado: 'en_taller' | 'completado';
}

export const useMantenimiento = () => {
  const [ordenes, setOrdenes] = useState<OrdenMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rentos_mantenimiento');
    if (saved) {
      try {
        setOrdenes(JSON.parse(saved));
      } catch (e) {
        setError('Error al cargar órdenes de mantenimiento');
      }
    }
    setLoading(false);
  }, []);

  const saveToStorage = (nuevasOrdenes: OrdenMantenimiento[]) => {
    setOrdenes(nuevasOrdenes);
    localStorage.setItem('rentos_mantenimiento', JSON.stringify(nuevasOrdenes));
  };

  const crearOrden = (orden: Omit<OrdenMantenimiento, 'id' | 'estado'>) => {
    const nuevaOrden: OrdenMantenimiento = {
      ...orden,
      id: `mant-${Date.now()}`,
      estado: 'en_taller'
    };
    saveToStorage([...ordenes, nuevaOrden]);
    return nuevaOrden;
  };

  const completarOrden = (id: string, costoFinal: number) => {
    const nuevasOrdenes = ordenes.map(orden =>
      orden.id === id
        ? { ...orden, estado: 'completado' as const, costo: costoFinal, fechaFinReal: new Date().toISOString().split('T')[0] }
        : orden
    );
    saveToStorage(nuevasOrdenes);
  };

  const eliminarOrden = (id: string) => {
    saveToStorage(ordenes.filter(o => o.id !== id));
  };

  return {
    ordenes,
    loading,
    error,
    crearOrden,
    completarOrden,
    eliminarOrden
  };
};
