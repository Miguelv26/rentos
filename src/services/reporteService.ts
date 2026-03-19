import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ReportFilters, ReportRow, ReportSummary } from '@/types/reportes';

export const exportReportToPDF = ({
  agencyName,
  filters,
  rows,
  summary,
}: {
  agencyName: string;
  filters: ReportFilters;
  rows: ReportRow[];
  summary: ReportSummary;
}) => {
  const document = new jsPDF();
  const generationDate = format(new Date(), 'yyyy-MM-dd HH:mm');

  document.setFontSize(16);
  document.text('RentOS - Reporte de Ingresos y Facturacion', 14, 16);

  document.setFontSize(11);
  document.text(`Agencia: ${agencyName}`, 14, 24);
  document.text(`Rango: ${filters.fechaInicio} a ${filters.fechaFin}`, 14, 30);
  document.text(`Metodo de pago: ${filters.metodoPago}`, 14, 36);
  document.text(`Generado: ${generationDate}`, 14, 42);

  document.setFontSize(10);
  document.text(`Total facturado: $${summary.totalFacturado.toLocaleString()}`, 14, 50);
  document.text(`Transacciones: ${summary.cantidadTransacciones}`, 14, 56);
  document.text(`Impuestos estimados: $${summary.impuestos.toLocaleString()}`, 14, 62);

  autoTable(document, {
    startY: 68,
    head: [['Reserva', 'Cliente', 'Fecha', 'Metodo', 'Estado', 'Monto']],
    body: rows.map((row) => [
      row.id,
      row.cliente,
      `${row.fechaInicio} - ${row.fechaFin}`,
      row.metodoPago,
      row.estadoReserva,
      `$${row.totalFinal.toLocaleString()}`,
    ]),
    styles: {
      fontSize: 9,
    },
  });

  document.save(`reporte-rentos-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`);
};
