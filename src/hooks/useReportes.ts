import { useMemo, useState } from 'react';
import { MetodoPago, Reserva } from '@/data/HU3_ReservasData';
import { useReservas } from './useReservas';
import { exportReportToPDF } from '@/services/reporteService';
import { ReportFilters, ReportRow, ReportSummary } from '@/types/reportes';

export const filterTransactionsByDateRange = (
  reservas: Reserva[],
  fechaInicio: string,
  fechaFin: string,
) => {
  const start = new Date(fechaInicio).getTime();
  const end = new Date(fechaFin).getTime();

  return reservas.filter((reserva) => {
    const bookingDate = new Date(reserva.fechaInicio).getTime();
    return bookingDate >= start && bookingDate <= end;
  });
};

export const filterTransactionsByPaymentMethod = (
  reservas: Reserva[],
  metodoPago: MetodoPago | 'todos',
) => {
  if (metodoPago === 'todos') {
    return reservas;
  }

  return reservas.filter((reserva) => reserva.pago.metodoPago === metodoPago);
};

export const buildReportSummary = (rows: ReportRow[]): ReportSummary => {
  const totalFacturado = rows.reduce((sum, row) => sum + row.totalFinal, 0);
  const subtotal = totalFacturado / 1.19;
  const impuestos = totalFacturado - subtotal;

  const paymentMap = rows.reduce<Record<MetodoPago, { cantidad: number; total: number }>>(
    (acc, row) => {
      const current = acc[row.metodoPago] ?? { cantidad: 0, total: 0 };
      acc[row.metodoPago] = {
        cantidad: current.cantidad + 1,
        total: current.total + row.totalFinal,
      };
      return acc;
    },
    {
      efectivo: { cantidad: 0, total: 0 },
      tarjeta_credito: { cantidad: 0, total: 0 },
      tarjeta_debito: { cantidad: 0, total: 0 },
      transferencia: { cantidad: 0, total: 0 },
      billetera: { cantidad: 0, total: 0 },
    },
  );

  return {
    reservasIncluidas: rows.length,
    totalFacturado,
    cantidadTransacciones: rows.length,
    subtotal,
    impuestos,
    paymentBreakdown: Object.entries(paymentMap)
      .map(([metodo, values]) => ({ metodo: metodo as MetodoPago, ...values }))
      .filter((item) => item.cantidad > 0),
  };
};

const toReportRows = (reservas: Reserva[]): ReportRow[] => {
  return reservas.map((reserva) => ({
    id: reserva.id,
    fechaInicio: reserva.fechaInicio,
    fechaFin: reserva.fechaFin,
    cliente: reserva.cliente,
    documento: reserva.documento,
    vehiculoId: reserva.vehiculoId,
    totalFinal: reserva.totalFinal,
    metodoPago: reserva.pago.metodoPago,
    estadoPago: reserva.pago.estado,
    estadoReserva: reserva.estado,
  }));
};

export const useReportes = () => {
  const { reservas } = useReservas();
  const [filters, setFilters] = useState<ReportFilters>({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    metodoPago: 'todos',
  });

  const rows = useMemo(() => {
    const activeReservas = reservas.filter((reserva) => reserva.estado !== 'cancelada');
    const inRange = filterTransactionsByDateRange(activeReservas, filters.fechaInicio, filters.fechaFin);
    const byMethod = filterTransactionsByPaymentMethod(inRange, filters.metodoPago);
    return toReportRows(byMethod);
  }, [reservas, filters]);

  const summary = useMemo(() => buildReportSummary(rows), [rows]);

  const exportPDF = (agencyName: string) => {
    exportReportToPDF({
      agencyName,
      filters,
      rows,
      summary,
    });
  };

  return {
    filters,
    setFilters,
    rows,
    summary,
    exportPDF,
  };
};
