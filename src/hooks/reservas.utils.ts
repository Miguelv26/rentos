import { Cliente } from '@/data/ClientesData';
import { Reserva } from '@/data/HU3_ReservasData';

export const DEFAULT_DEPOSIT_RATE = 0.2;

export const calculateReservationDays = (fechaInicio: string, fechaFin: string): number => {
  const inicio = new Date(fechaInicio).getTime();
  const fin = new Date(fechaFin).getTime();
  const diff = fin - inicio;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const hasReservationOverlap = (
  reservas: Reserva[],
  vehiculoId: number,
  fechaInicio: string,
  fechaFin: string,
  excludeReservationId?: string,
): boolean => {
  const inicioSolicitud = new Date(fechaInicio).getTime();
  const finSolicitud = new Date(fechaFin).getTime();

  return reservas.some((reserva) => {
    if (reserva.vehiculoId !== vehiculoId || reserva.estado === 'cancelada') {
      return false;
    }

    if (excludeReservationId && reserva.id === excludeReservationId) {
      return false;
    }

    const inicioReserva = new Date(reserva.fechaInicio).getTime();
    const finReserva = new Date(reserva.fechaFin).getTime();

    return inicioSolicitud <= finReserva && finSolicitud >= inicioReserva;
  });
};

export const calculateReservationAmounts = (
  precioDia: number,
  dias: number,
  totalExtras: number,
  depositRate: number = DEFAULT_DEPOSIT_RATE,
) => {
  const subtotalRenta = precioDia * dias;
  const total = subtotalRenta + totalExtras;
  const deposito = Math.round(total * depositRate);

  return {
    subtotalRenta,
    total,
    deposito,
  };
};

export const isLicenseValidForDate = (cliente: Cliente, referenceDate: string): boolean => {
  const ref = new Date(referenceDate).setHours(0, 0, 0, 0);
  const expiration = new Date(cliente.licencia.fechaVencimiento).setHours(0, 0, 0, 0);
  return expiration >= ref;
};

export const findClienteByDocumento = (clientes: Cliente[], documento: string): Cliente | undefined => {
  const normalized = documento.trim().toLowerCase();
  return clientes.find((cliente) => cliente.numeroDocumento.trim().toLowerCase() === normalized);
};
