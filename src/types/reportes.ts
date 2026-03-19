import { MetodoPago, Reserva } from '@/data/HU3_ReservasData';

export type ReportFilters = {
  fechaInicio: string;
  fechaFin: string;
  metodoPago: MetodoPago | 'todos';
};

export type ReportRow = {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  cliente: string;
  documento: string;
  vehiculoId: number;
  totalFinal: number;
  metodoPago: MetodoPago;
  estadoPago: string;
  estadoReserva: Reserva['estado'];
};

export type PaymentBreakdown = {
  metodo: MetodoPago;
  cantidad: number;
  total: number;
};

export type ReportSummary = {
  reservasIncluidas: number;
  totalFacturado: number;
  cantidadTransacciones: number;
  subtotal: number;
  impuestos: number;
  paymentBreakdown: PaymentBreakdown[];
};
