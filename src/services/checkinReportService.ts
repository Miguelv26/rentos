import { jsPDF } from 'jspdf';
import { InspeccionVehiculo } from '@/data/HU2_CheckinData';
import { Vehiculo } from '@/data/HU1_VehiculosData';
import { Reserva } from '@/data/HU3_ReservasData';

interface ReportData {
  reserva: Reserva;
  vehiculo: Vehiculo;
  checkIn?: InspeccionVehiculo;
  checkOut: InspeccionVehiculo;
}

const getDamageItems = (checkOut: InspeccionVehiculo): string[] => {
  const failedChecklist = Object.entries(checkOut.checklist)
    .filter(([, ok]) => !ok)
    .map(([item]) => item);

  return failedChecklist;
};

export const generateDamageReportPDF = ({ reserva, vehiculo, checkIn, checkOut }: ReportData) => {
  const doc = new jsPDF();
  const damageItems = getDamageItems(checkOut);
  const kmDelta = checkIn ? checkOut.kilometraje - checkIn.kilometraje : 0;

  doc.setFontSize(16);
  doc.text('RentOS - Reporte de Danos', 14, 18);

  doc.setFontSize(11);
  doc.text(`Reserva: ${reserva.id}`, 14, 30);
  doc.text(`Cliente: ${reserva.cliente}`, 14, 38);
  doc.text(`Vehiculo: ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa})`, 14, 46);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 54);

  doc.text(`Kilometraje check-in: ${checkIn?.kilometraje ?? 'N/A'} km`, 14, 68);
  doc.text(`Kilometraje check-out: ${checkOut.kilometraje} km`, 14, 76);
  doc.text(`Recorrido estimado: ${kmDelta} km`, 14, 84);
  doc.text(`Combustible check-out: ${checkOut.nivelCombustible}%`, 14, 92);

  doc.text('Items con novedad:', 14, 106);
  if (damageItems.length === 0) {
    doc.text('- Sin danos detectados en checklist', 20, 114);
  } else {
    damageItems.forEach((item, index) => {
      doc.text(`- ${item}`, 20, 114 + (index * 8));
    });
  }

  doc.text('Observaciones:', 14, 150);
  doc.text(checkOut.observaciones || 'Sin observaciones', 20, 158);

  doc.save(`reporte-danos-${reserva.id}.pdf`);
};
