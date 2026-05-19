import { Cliente, ClienteIncidente } from '@/data/ClientesData';

export type ClienteInput = Omit<
  Cliente,
  'id' | 'reservasTotales' | 'totalGastado' | 'cancelaciones' | 'score' | 'incidentes'
>;

export const calculateAge = (birthDate: string, referenceDate: Date = new Date()): number => {
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);

  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();
  const dayDiff = ref.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
};

export const isAdult = (birthDate: string, minimumAge: number = 18): boolean => {
  return calculateAge(birthDate) >= minimumAge;
};

export const normalizeIncidente = (incidente: ClienteIncidente): ClienteIncidente => {
  return {
    ...incidente,
    pagado: incidente.pagado ?? false,
    fechaPago: incidente.fechaPago,
  };
};

export const getIncidentesPendientes = (
  incidentes: ClienteIncidente[] = [],
): ClienteIncidente[] => {
  return incidentes.filter((incidente) => !incidente.pagado);
};

export const getTotalMultasPendientes = (
  incidentes: ClienteIncidente[] = [],
): number => {
  return getIncidentesPendientes(incidentes).reduce(
    (acc, incidente) => acc + (incidente.monto ?? 0),
    0,
  );
};

type ClienteScoreInput = {
  reservasTotales?: number;
  cancelaciones?: number;
  incidentes?: ClienteIncidente[] | unknown[];
  estado?: string;
  reservas?: unknown[];
  totalReservas?: number;
  reservasCompletadas?: number;
  reservasCanceladas?: number;
  incidentesCount?: number;
};

export function calculateClienteScore(
  reservasTotales: number,
  cancelaciones: number,
  incidentes?: ClienteIncidente[],
): number;

export function calculateClienteScore(cliente: ClienteScoreInput): number;

export function calculateClienteScore(
  arg1: number | ClienteScoreInput,
  arg2: number = 0,
  arg3: ClienteIncidente[] = [],
): number {
  let reservasTotales: number;
  let cancelaciones: number;
  let incidentes: ClienteIncidente[] | unknown[];

  if (typeof arg1 === 'object') {
    reservasTotales =
      arg1.reservasTotales ??
      arg1.totalReservas ??
      arg1.reservasCompletadas ??
      arg1.reservas?.length ??
      0;

    cancelaciones =
      arg1.cancelaciones ??
      arg1.reservasCanceladas ??
      0;

    incidentes = arg1.incidentes ?? [];
  } else {
    reservasTotales = arg1;
    cancelaciones = arg2;
    incidentes = arg3;
  }

  const incidentesCliente = incidentes as ClienteIncidente[];
  const totalPendiente = getTotalMultasPendientes(incidentesCliente);
  const totalIncidentes = incidentesCliente.length;
  const incidentesPagados = incidentesCliente.filter((incidente) => incidente.pagado).length;

  const bonusReservas = Math.min(reservasTotales, 10) * 2;
  const penalizacionCancelaciones = cancelaciones * 8;
  const penalizacionPendiente = totalPendiente * 0.08;
  const penalizacionHistorial = totalIncidentes * 8;
  const penalizacionPagados = incidentesPagados * 6;

  const score =
    100 +
    bonusReservas -
    penalizacionCancelaciones -
    penalizacionPendiente -
    penalizacionHistorial -
    penalizacionPagados;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export const normalizeCliente = (cliente: Cliente): Cliente => {
  const incidentes = (cliente.incidentes ?? []).map(normalizeIncidente);

  return {
    ...cliente,
    incidentes,
    score: calculateClienteScore(
      cliente.reservasTotales ?? 0,
      cliente.cancelaciones ?? 0,
      incidentes,
    ),
  };
};

export function validateClienteInput(cliente: ClienteInput): string[] {
  const errors: string[] = [];

  if (!cliente.nombre?.trim()) {
    errors.push('El nombre es obligatorio');
  }

  if (!cliente.telefono?.trim()) {
    errors.push('El teléfono es obligatorio');
  }

  if (!cliente.email?.trim()) {
    errors.push('El correo es obligatorio');
  }

  if (!cliente.numeroDocumento?.trim()) {
    errors.push('El número de documento es obligatorio');
  }

  return errors;
}