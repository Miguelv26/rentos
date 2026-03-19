export interface ReglaTarifa {
  id: string;
  nombre: string;
  tipo: 'temporada_alta' | 'fin_semana' | 'descuento_largo';
  porcentaje: number; // positivo para incremento, negativo para descuento
  fechaInicio?: string;
  fechaFin?: string;
  vehiculosAplicables: number[] | 'todos';
  activa: boolean;
}

export const TarifasMock: ReglaTarifa[] = [
  {
    id: 'tar-001',
    nombre: 'Temporada Alta Diciembre',
    tipo: 'temporada_alta',
    porcentaje: 30,
    fechaInicio: '2026-12-15',
    fechaFin: '2027-01-10',
    vehiculosAplicables: 'todos',
    activa: true
  },
  {
    id: 'tar-002',
    nombre: 'Fin de Semana',
    tipo: 'fin_semana',
    porcentaje: 15,
    vehiculosAplicables: 'todos',
    activa: true
  },
  {
    id: 'tar-003',
    nombre: 'Descuento Semanal (+7 días)',
    tipo: 'descuento_largo',
    porcentaje: -10,
    vehiculosAplicables: 'todos',
    activa: true
  },
  {
    id: 'tar-004',
    nombre: 'Temporada Alta Semana Santa',
    tipo: 'temporada_alta',
    porcentaje: 25,
    fechaInicio: '2026-04-10',
    fechaFin: '2026-04-20',
    vehiculosAplicables: 'todos',
    activa: true
  }
];
