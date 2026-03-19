import { useEffect, useState } from 'react';
import { CHECKLIST_DEFAULT, InspeccionVehiculo, TipoInspeccion } from '@/data/HU2_CheckinData';

const STORAGE_KEY = 'rentos_inspecciones';

interface SaveInspectionPayload {
  reservaId: string;
  vehiculoId: number;
  tipo: TipoInspeccion;
  kilometraje: number;
  nivelCombustible: number;
  checklist: InspeccionVehiculo['checklist'];
  fotos: string[];
  observaciones: string;
}

export const validateInspectionNumbers = (kilometraje: number, nivelCombustible: number): string | null => {
  if (!Number.isFinite(kilometraje) || kilometraje < 0) {
    return 'El kilometraje debe ser un número válido mayor o igual a 0.';
  }

  if (!Number.isFinite(nivelCombustible) || nivelCombustible < 0 || nivelCombustible > 100) {
    return 'El nivel de combustible debe estar entre 0 y 100.';
  }

  return null;
};

export const useCheckins = () => {
  const [inspecciones, setInspecciones] = useState<InspeccionVehiculo[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inspecciones));
  }, [inspecciones]);

  const saveToStorage = (next: InspeccionVehiculo[]) => {
    setInspecciones(next);
  };

  const saveInspection = (payload: SaveInspectionPayload): InspeccionVehiculo => {
    const validationError = validateInspectionNumbers(payload.kilometraje, payload.nivelCombustible);

    if (validationError) {
      throw new Error(validationError);
    }

    const inspection: InspeccionVehiculo = {
      id: `${payload.tipo}-${Date.now()}`,
      fechaRegistro: new Date().toISOString(),
      ...payload,
      checklist: {
        ...CHECKLIST_DEFAULT,
        ...payload.checklist,
      },
      fotos: payload.fotos.filter((foto) => foto.trim().length > 0),
    };

    saveToStorage([...inspecciones, inspection]);
    return inspection;
  };

  const getInspectionsByReserva = (reservaId: string) => {
    return inspecciones.filter((inspection) => inspection.reservaId === reservaId);
  };

  const getInspectionPair = (reservaId: string) => {
    const byReserva = getInspectionsByReserva(reservaId);
    const checkIn = byReserva.find((inspection) => inspection.tipo === 'check-in');
    const checkOut = byReserva.find((inspection) => inspection.tipo === 'check-out');

    return { checkIn, checkOut };
  };

  return {
    inspecciones,
    saveInspection,
    getInspectionsByReserva,
    getInspectionPair,
  };
};
