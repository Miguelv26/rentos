import { useState, useEffect } from 'react';
import { ReglaTarifa, TarifasMock } from '@/data/TarifasData';

export const useTarifas = () => {
  const [tarifas, setTarifas] = useState<ReglaTarifa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('rentos_tarifas');
    if (saved) {
      setTarifas(JSON.parse(saved));
    } else {
      setTarifas(TarifasMock);
      localStorage.setItem('rentos_tarifas', JSON.stringify(TarifasMock));
    }
    setLoading(false);
  }, []);

  const saveToStorage = (nuevasTarifas: ReglaTarifa[]) => {
    setTarifas(nuevasTarifas);
    localStorage.setItem('rentos_tarifas', JSON.stringify(nuevasTarifas));
  };

  const crearTarifa = (tarifa: Omit<ReglaTarifa, 'id'>) => {
    const nuevaTarifa: ReglaTarifa = {
      ...tarifa,
      id: `tar-${Date.now()}`
    };
    saveToStorage([...tarifas, nuevaTarifa]);
    return nuevaTarifa;
  };

  const actualizarTarifa = (id: string, cambios: Partial<ReglaTarifa>) => {
    const nuevasTarifas = tarifas.map(t => t.id === id ? { ...t, ...cambios } : t);
    saveToStorage(nuevasTarifas);
  };

  const eliminarTarifa = (id: string) => {
    saveToStorage(tarifas.filter(t => t.id !== id));
  };

  const calcularPrecioFinal = (precioBase: number, fechaInicio: string, fechaFin: string, vehiculoId?: number): number => {
    let precioFinal = precioBase;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    // Aplicar reglas de tarifas
    tarifas.filter(t => t.activa).forEach(tarifa => {
      // Verificar si aplica al vehículo
      if (tarifa.vehiculosAplicables !== 'todos' && vehiculoId && !tarifa.vehiculosAplicables.includes(vehiculoId)) {
        return;
      }

      // Aplicar según tipo
      if (tarifa.tipo === 'descuento_largo' && dias >= 7) {
        precioFinal = precioFinal * (1 + tarifa.porcentaje / 100);
      } else if (tarifa.tipo === 'fin_semana') {
        // Verificar si incluye fin de semana
        const esFinde = inicio.getDay() === 6 || inicio.getDay() === 0 || fin.getDay() === 6 || fin.getDay() === 0;
        if (esFinde) {
          precioFinal = precioFinal * (1 + tarifa.porcentaje / 100);
        }
      } else if (tarifa.tipo === 'temporada_alta' && tarifa.fechaInicio && tarifa.fechaFin) {
        const inicioTemp = new Date(tarifa.fechaInicio);
        const finTemp = new Date(tarifa.fechaFin);
        // Verificar si hay solapamiento
        if (inicio <= finTemp && fin >= inicioTemp) {
          precioFinal = precioFinal * (1 + tarifa.porcentaje / 100);
        }
      }
    });

    return Math.round(precioFinal * dias);
  };

  return {
    tarifas,
    loading,
    crearTarifa,
    actualizarTarifa,
    eliminarTarifa,
    calcularPrecioFinal
  };
};
