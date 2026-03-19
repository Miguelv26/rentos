export type TipoInspeccion = 'check-in' | 'check-out';

export interface ChecklistEstado {
  llantas: boolean;
  frenos: boolean;
  luces: boolean;
  espejos: boolean;
  carroceria: boolean;
}

export interface InspeccionVehiculo {
  id: string;
  reservaId: string;
  vehiculoId: number;
  tipo: TipoInspeccion;
  kilometraje: number;
  nivelCombustible: number;
  checklist: ChecklistEstado;
  fotos: string[];
  observaciones: string;
  fechaRegistro: string;
}

export const CHECKLIST_DEFAULT: ChecklistEstado = {
  llantas: true,
  frenos: true,
  luces: true,
  espejos: true,
  carroceria: true,
};
