export interface Notificacion {
  id: string;
  tipo: 'confirmacion' | 'recordatorio' | 'cancelacion' | 'recibo' | 'mora';
  destinatario: string;
  email: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  estado: 'enviado' | 'fallido' | 'pendiente';
  reservaId?: string;
}

export interface PlantillaNotificacion {
  tipo: 'confirmacion' | 'recordatorio' | 'mora';
  asuntoTemplate: string;
  mensajeTemplate: string;
}

export interface NotificacionProgramada {
  id: string;
  reservaId: string;
  destinatario: string;
  email: string;
  vehiculo: string;
  fechaInicio: string;
  sendAt: string;
  estado: 'pendiente' | 'enviado';
}

export const PlantillasMock: PlantillaNotificacion[] = [
  {
    tipo: 'confirmacion',
    asuntoTemplate: 'Confirmación de Reserva #{{reservaId}}',
    mensajeTemplate: 'Hola {{cliente}}, tu reserva para {{vehiculo}} fue confirmada para {{fechas}}.',
  },
  {
    tipo: 'recordatorio',
    asuntoTemplate: 'Recordatorio de Reserva #{{reservaId}}',
    mensajeTemplate: 'Hola {{cliente}}, te recordamos tu entrega de {{vehiculo}} para {{fechaInicio}}.',
  },
  {
    tipo: 'mora',
    asuntoTemplate: 'Alerta de mora - Reserva #{{reservaId}}',
    mensajeTemplate: 'Hola {{cliente}}, tienes un saldo pendiente asociado a la reserva {{reservaId}}.',
  },
];

export const NotificacionesMock: Notificacion[] = [
  {
    id: 'not-001',
    tipo: 'confirmacion',
    destinatario: 'Juan Pérez García',
    email: 'juan.perez@email.com',
    asunto: 'Confirmación de Reserva #RES-001',
    mensaje: 'Tu reserva ha sido confirmada para el vehículo Yamaha MT-03 del 10/03/2026 al 15/03/2026.',
    fecha: '2026-03-09T10:30:00',
    estado: 'enviado',
    reservaId: 'res-001'
  },
  {
    id: 'not-002',
    tipo: 'recordatorio',
    destinatario: 'María Rodríguez López',
    email: 'maria.rodriguez@email.com',
    asunto: 'Recordatorio: Recogida mañana',
    mensaje: 'Te recordamos que mañana debes recoger tu vehículo Honda CB650R a las 09:00 AM.',
    fecha: '2026-03-10T18:00:00',
    estado: 'enviado',
    reservaId: 'res-002'
  },
  {
    id: 'not-003',
    tipo: 'cancelacion',
    destinatario: 'Carlos Martínez Silva',
    email: 'carlos.martinez@email.com',
    asunto: 'Cancelación de Reserva #RES-003',
    mensaje: 'Tu reserva ha sido cancelada según tu solicitud. El reembolso se procesará en 3-5 días hábiles.',
    fecha: '2026-03-08T14:20:00',
    estado: 'enviado',
    reservaId: 'res-003'
  }
];
