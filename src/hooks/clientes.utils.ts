import { Cliente } from '@/data/ClientesData';

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

export const normalizeCliente = (cliente: Cliente): Cliente => {
  return {
    ...cliente,
    incidentes: cliente.incidentes ?? [],
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

  return errors;
}


export function calculateClienteScore(cliente: {
  reservasTotales?: number;
  cancelaciones?: number;
  incidentes?: unknown[];
  estado?: string;
  reservas?: unknown[];
  totalReservas?: number;
  reservasCompletadas?: number;
  reservasCanceladas?: number;
  incidentesCount?: number;
}): number {
  const reservas =
    cliente.reservasTotales ??
    cliente.totalReservas ??
    cliente.reservasCompletadas ??
    cliente.reservas?.length ??
    0;

  const cancelaciones = cliente.cancelaciones ?? cliente.reservasCanceladas ?? 0;

  const incidentes =
    cliente.incidentesCount ??
    cliente.incidentes?.length ??
    0;

  let score = 60;

  score += Math.min(reservas * 5, 30);
  score -= cancelaciones * 8;
  score -= incidentes * 15;

  if (cliente.estado === 'activo') {
    score += 10;
  }

  if (cliente.estado === 'bloqueado') {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
};


