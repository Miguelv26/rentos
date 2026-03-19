import { useState, useEffect } from 'react';
import {
  Notificacion,
  NotificacionProgramada,
  NotificacionesMock,
  PlantillaNotificacion,
  PlantillasMock,
} from '@/data/NotificacionesData';
import toast from 'react-hot-toast';
import { applyTemplateString, calculateReminderSendAt, shouldTrigger24hReminder } from '@/hooks/notificaciones.utils';
import { useConfig } from '@/context/ConfigContext';

const STORAGE_NOTIFICACIONES = 'rentos_notificaciones';
const STORAGE_PLANTILLAS = 'rentos_notificacion_templates';
const STORAGE_PROGRAMADAS = 'rentos_notificacion_queue';

type NotificacionInput = Omit<Notificacion, 'id' | 'fecha' | 'estado'>;

interface ReminderScheduleInput {
  reservaId: string;
  destinatario: string;
  email: string;
  vehiculo: string;
  fechaInicio: string;
}

const fallbackNotificacionesCopy: Record<string, string> = {
  emailEnviado: 'Email enviado a',
  asuntoConfirmacionDefault: 'Confirmación de Reserva #',
  mensajeConfirmacionDefault: 'Tu reserva ha sido confirmada para el vehículo',
  asuntoCancelacionDefault: 'Cancelación de Reserva #',
  mensajeCancelacionDefault: 'Tu reserva ha sido cancelada según tu solicitud. El reembolso se procesará en 3-5 días hábiles.',
  asuntoReciboDefault: 'Recibo de Pago - Reserva #',
  mensajeReciboDefault: 'Gracias por tu preferencia. El monto total de',
  mensajeReciboProcesado: 'ha sido procesado exitosamente.',
};

export const useNotificaciones = () => {
  const config = useConfig();
  const i18n = (key: string) => {
    if (config?.t) {
      return config.t('notificacionesHu', key);
    }

    return fallbackNotificacionesCopy[key] ?? key;
  };
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [templates, setTemplates] = useState<PlantillaNotificacion[]>([]);
  const [programadas, setProgramadas] = useState<NotificacionProgramada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_NOTIFICACIONES);
    if (saved) {
      setNotificaciones(JSON.parse(saved));
    } else {
      setNotificaciones(NotificacionesMock);
      localStorage.setItem(STORAGE_NOTIFICACIONES, JSON.stringify(NotificacionesMock));
    }

    const savedTemplates = localStorage.getItem(STORAGE_PLANTILLAS);
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      setTemplates(PlantillasMock);
      localStorage.setItem(STORAGE_PLANTILLAS, JSON.stringify(PlantillasMock));
    }

    const savedQueue = localStorage.getItem(STORAGE_PROGRAMADAS);
    if (savedQueue) {
      setProgramadas(JSON.parse(savedQueue));
    } else {
      setProgramadas([]);
      localStorage.setItem(STORAGE_PROGRAMADAS, JSON.stringify([]));
    }

    setLoading(false);
  }, []);

  const saveToStorage = (nuevasNotificaciones: Notificacion[]) => {
    setNotificaciones(nuevasNotificaciones);
    localStorage.setItem(STORAGE_NOTIFICACIONES, JSON.stringify(nuevasNotificaciones));
  };

  const saveTemplates = (next: PlantillaNotificacion[]) => {
    setTemplates(next);
    localStorage.setItem(STORAGE_PLANTILLAS, JSON.stringify(next));
  };

  const saveProgramadas = (next: NotificacionProgramada[]) => {
    setProgramadas(next);
    localStorage.setItem(STORAGE_PROGRAMADAS, JSON.stringify(next));
  };

  const registrarNotificacion = (notificacion: NotificacionInput, estado: Notificacion['estado'] = 'enviado') => {
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id: `not-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fecha: new Date().toISOString(),
      estado,
    };

    saveToStorage([nuevaNotificacion, ...notificaciones]);
    return nuevaNotificacion;
  };

  const enviarNotificacion = (notificacion: NotificacionInput): Promise<Notificacion> => {
    return Promise.resolve(registrarNotificacion(notificacion, 'enviado')).then((created) => {
      toast.success(`${i18n('emailEnviado')} ${notificacion.email}`);
      return created;
    });
  };

  const updateTemplate = (
    tipo: PlantillaNotificacion['tipo'],
    asuntoTemplate: string,
    mensajeTemplate: string,
  ) => {
    const next = templates.map((template) => (
      template.tipo === tipo ? { ...template, asuntoTemplate, mensajeTemplate } : template
    ));
    saveTemplates(next);
  };

  const buildTemplate = (tipo: PlantillaNotificacion['tipo'], variables: Record<string, string | number>) => {
    const template = templates.find((item) => item.tipo === tipo);
    if (!template) {
      return {
        asunto: '',
        mensaje: '',
      };
    }

    return {
      asunto: applyTemplateString(template.asuntoTemplate, variables),
      mensaje: applyTemplateString(template.mensajeTemplate, variables),
    };
  };

  const scheduleReminder24h = (payload: ReminderScheduleInput) => {
    const exists = programadas.some((item) => item.reservaId === payload.reservaId && item.estado === 'pendiente');
    if (exists) {
      return null;
    }

    const programada: NotificacionProgramada = {
      id: `prog-${Date.now()}-${payload.reservaId}`,
      reservaId: payload.reservaId,
      destinatario: payload.destinatario,
      email: payload.email,
      vehiculo: payload.vehiculo,
      fechaInicio: payload.fechaInicio,
      sendAt: calculateReminderSendAt(payload.fechaInicio),
      estado: 'pendiente',
    };

    saveProgramadas([programada, ...programadas]);
    return programada;
  };

  const processScheduledReminders = async (nowIso: string = new Date().toISOString()) => {
    const due = programadas.filter((item) => item.estado === 'pendiente' && shouldTrigger24hReminder(item.fechaInicio, nowIso));
    if (due.length === 0) {
      return [];
    }

    const sent = await Promise.all(due.map(async (item) => {
      const content = buildTemplate('recordatorio', {
        reservaId: item.reservaId,
        cliente: item.destinatario,
        vehiculo: item.vehiculo,
        fechaInicio: item.fechaInicio,
      });

      return enviarNotificacion({
        tipo: 'recordatorio',
        destinatario: item.destinatario,
        email: item.email,
        asunto: content.asunto,
        mensaje: content.mensaje,
        reservaId: item.reservaId,
      });
    }));

    const nextQueue = programadas.map((item) => (
      due.some((dueItem) => dueItem.id === item.id)
        ? { ...item, estado: 'enviado' as const }
        : item
    ));
    saveProgramadas(nextQueue);

    return sent;
  };

  const enviarConfirmacionReserva = (reservaId: string, cliente: string, email: string, vehiculo: string, fechas: string) => {
    const content = buildTemplate('confirmacion', {
      reservaId,
      cliente,
      vehiculo,
      fechas,
    });

    return enviarNotificacion({
      tipo: 'confirmacion',
      destinatario: cliente,
      email,
      asunto: content.asunto || `${i18n('asuntoConfirmacionDefault')}${reservaId}`,
      mensaje: content.mensaje || `${i18n('mensajeConfirmacionDefault')} ${vehiculo} ${fechas}.`,
      reservaId
    });
  };

  const enviarCancelacion = (reservaId: string, cliente: string, email: string) => {
    return enviarNotificacion({
      tipo: 'cancelacion',
      destinatario: cliente,
      email,
      asunto: `${i18n('asuntoCancelacionDefault')}${reservaId}`,
      mensaje: i18n('mensajeCancelacionDefault'),
      reservaId
    });
  };

  const enviarRecibo = (reservaId: string, cliente: string, email: string, monto: number) => {
    return enviarNotificacion({
      tipo: 'recibo',
      destinatario: cliente,
      email,
      asunto: `${i18n('asuntoReciboDefault')}${reservaId}`,
      mensaje: `${i18n('mensajeReciboDefault')} $${monto} ${i18n('mensajeReciboProcesado')}`,
      reservaId
    });
  };

  return {
    notificaciones,
    templates,
    programadas,
    loading,
    enviarNotificacion,
    enviarConfirmacionReserva,
    enviarCancelacion,
    enviarRecibo,
    updateTemplate,
    buildTemplate,
    scheduleReminder24h,
    processScheduledReminders,
  };
};
