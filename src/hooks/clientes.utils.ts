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

export const getIncidentesPendientes = (incidentes: ClienteIncidente[] = []): ClienteIncidente[] => {
  return incidentes.filter((incidente) => !incidente.pagado);
};

export const getTotalMultasPendientes = (incidentes: ClienteIncidente[] = []): number => {
  return getIncidentesPendientes(incidentes).reduce((acc, incidente) => acc + (incidente.monto ?? 0), 0);
};

export const calculateClienteScore = (
  reservasTotales: number,
  cancelaciones: number,
  incidentes: ClienteIncidente[] = [],
): number => {
  const totalPendiente = getTotalMultasPendientes(incidentes);
  const totalIncidentes = incidentes.length;
  const incidentesPagados = incidentes.filter((incidente) => incidente.pagado).length;

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
};

export const normalizeCliente = (cliente: Cliente): Cliente => {
  const incidentes = (cliente.incidentes ?? []).map(normalizeIncidente);

  return {
    ...cliente,
    incidentes,
    score: calculateClienteScore(
      cliente.reservasTotales,
      cliente.cancelaciones,
      incidentes,
    ),
  };
};

export const validateClienteInput = (cliente: ClienteInput): void => {
  if (!isAdult(cliente.fechaNacimiento)) {
    throw new Error('El cliente debe ser mayor de edad para registrarse.');
  }
};