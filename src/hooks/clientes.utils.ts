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

export const validateClienteInput = (cliente: ClienteInput): void => {
  if (!isAdult(cliente.fechaNacimiento)) {
    throw new Error('El cliente debe ser mayor de edad para registrarse.');
  }
};
