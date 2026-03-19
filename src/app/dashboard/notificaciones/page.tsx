"use client";
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { useReservas } from '@/hooks/useReservas';
import { useClientes } from '@/hooks/useClientes';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import toast from 'react-hot-toast';
import { useConfig } from '@/context/ConfigContext';

export default function NotificacionesPage() {
  const {
    notificaciones,
    templates,
    programadas,
    updateTemplate,
    processScheduledReminders,
    scheduleReminder24h,
  } = useNotificaciones();
  const { reservas } = useReservas();
  const { clientes } = useClientes();
  const { t, lang } = useConfig();

  const [templateForm, setTemplateForm] = useState(() => {
    const current = templates.find((item) => item.tipo === 'recordatorio');
    return {
      tipo: 'recordatorio' as 'confirmacion' | 'recordatorio' | 'mora',
      asuntoTemplate: current?.asuntoTemplate ?? '',
      mensajeTemplate: current?.mensajeTemplate ?? '',
    };
  });

  const tasaExito = notificaciones.length > 0
    ? ((notificaciones.filter(n => n.estado === 'enviado').length / notificaciones.length) * 100).toFixed(0)
    : '0';

  const reservasCandidatas = useMemo(() => {
    return reservas.filter((reserva) => reserva.estado === 'confirmada');
  }, [reservas]);

  useEffect(() => {
    const current = templates.find((item) => item.tipo === templateForm.tipo);
    if (!current) {
      return;
    }

    setTemplateForm((prev) => ({
      ...prev,
      asuntoTemplate: current.asuntoTemplate,
      mensajeTemplate: current.mensajeTemplate,
    }));
  }, [templates, templateForm.tipo]);

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'confirmacion': return '✅';
      case 'recordatorio': return '⏰';
      case 'cancelacion': return '❌';
      case 'recibo': return '🧾';
      case 'mora': return '⚠️';
      default: return '📧';
    }
  };

  const scheduleRemindersForConfirmadas = () => {
    let created = 0;
    reservasCandidatas.forEach((reserva) => {
      const cliente = clientes.find((item) => item.numeroDocumento === reserva.documento);
      if (!cliente) {
        return;
      }

      const programada = scheduleReminder24h({
        reservaId: reserva.id,
        destinatario: cliente.nombre,
        email: cliente.email,
        vehiculo: `Vehículo ${reserva.vehiculoId}`,
        fechaInicio: reserva.fechaInicio,
      });

      if (programada) {
        created += 1;
      }
    });

    toast.success(created > 0 ? `${created} ${t('notificacionesHu', 'successProgramadas')}` : t('notificacionesHu', 'noProgramadas'));
  };

  const handleTemplateTypeChange = (tipo: 'confirmacion' | 'recordatorio' | 'mora') => {
    const current = templates.find((item) => item.tipo === tipo);
    setTemplateForm({
      tipo,
      asuntoTemplate: current?.asuntoTemplate ?? '',
      mensajeTemplate: current?.mensajeTemplate ?? '',
    });
  };

  const handleSaveTemplate = () => {
    updateTemplate(templateForm.tipo, templateForm.asuntoTemplate, templateForm.mensajeTemplate);
    toast.success(t('notificacionesHu', 'successTemplate'));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase">🔔 {t('notificacionesHu', 'title')}</h1>
          <p className="text-gray-500">{t('notificacionesHu', 'subtitle')}</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('notificacionesHu', 'totalEnviados')}</p>
            <p className="text-3xl font-black text-white">{notificaciones.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('notificacionesHu', 'exitosos')}</p>
            <p className="text-3xl font-black text-green-400">
              {notificaciones.filter(n => n.estado === 'enviado').length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('notificacionesHu', 'fallidos')}</p>
            <p className="text-3xl font-black text-red-400">
              {notificaciones.filter(n => n.estado === 'fallido').length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('notificacionesHu', 'tasaExito')}</p>
            <p className="text-3xl font-black text-[#00E5FF]">
              {tasaExito}%
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h2 className="font-bold mb-3">{t('notificacionesHu', 'plantillas')}</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="tipoPlantilla" className="block text-xs text-gray-500 uppercase font-bold mb-1">{t('notificacionesHu', 'tipo')}</label>
                <select
                  id="tipoPlantilla"
                  value={templateForm.tipo}
                  onChange={(event) => handleTemplateTypeChange(event.target.value as 'confirmacion' | 'recordatorio' | 'mora')}
                  className="w-full bg-black/20 border border-gray-700 rounded p-2 text-sm"
                >
                  <option value="confirmacion">{t('notificacionesHu', 'confirmacion')}</option>
                  <option value="recordatorio">{t('notificacionesHu', 'recordatorio')}</option>
                  <option value="mora">{t('notificacionesHu', 'mora')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="asuntoTemplate" className="block text-xs text-gray-500 uppercase font-bold mb-1">{t('notificacionesHu', 'asunto')}</label>
                <input
                  id="asuntoTemplate"
                  value={templateForm.asuntoTemplate}
                  onChange={(event) => setTemplateForm((prev) => ({ ...prev, asuntoTemplate: event.target.value }))}
                  className="w-full bg-black/20 border border-gray-700 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="mensajeTemplate" className="block text-xs text-gray-500 uppercase font-bold mb-1">{t('notificacionesHu', 'mensaje')}</label>
                <textarea
                  id="mensajeTemplate"
                  value={templateForm.mensajeTemplate}
                  onChange={(event) => setTemplateForm((prev) => ({ ...prev, mensajeTemplate: event.target.value }))}
                  className="w-full bg-black/20 border border-gray-700 rounded p-2 text-sm min-h-24"
                />
              </div>
              <button type="button" onClick={handleSaveTemplate} className="bg-[#00E5FF] text-black px-4 py-2 rounded text-sm font-bold">
                {t('notificacionesHu', 'guardarPlantilla')}
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold mb-3">{t('notificacionesHu', 'auto24h')}</h2>
            <p className="text-sm text-gray-400 mb-3">{t('notificacionesHu', 'confirmadasDetectadas')}: {reservasCandidatas.length}</p>
            <p className="text-sm text-gray-400 mb-4">{t('notificacionesHu', 'colaProgramada')}: {programadas.filter((item) => item.estado === 'pendiente').length} {t('notificacionesHu', 'pendientes')}</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={scheduleRemindersForConfirmadas} className="bg-white/10 px-4 py-2 rounded text-sm">{t('notificacionesHu', 'programar')}</button>
              <button
                type="button"
                onClick={async () => {
                  const sent = await processScheduledReminders(new Date().toISOString());
                  toast.success(sent.length > 0 ? `${sent.length} ${t('notificacionesHu', 'successEnviados')}` : t('notificacionesHu', 'noEnviados'));
                }}
                className="bg-white/10 px-4 py-2 rounded text-sm"
              >
                {t('notificacionesHu', 'procesar')}
              </button>
            </div>
          </Card>
        </div>

        {/* Tabla de Notificaciones */}
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl overflow-hidden">
          <Table caption={t('notificacionesHu', 'tablaCaption')}>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>{t('notificacionesHu', 'tipo')}</TableHead>
                <TableHead>{t('notificacionesHu', 'destinatario')}</TableHead>
                <TableHead>{t('notificacionesHu', 'asunto')}</TableHead>
                <TableHead>{t('notificacionesHu', 'fecha')}</TableHead>
                <TableHead>{t('notificacionesHu', 'estado')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificaciones.map((notif) => (
                <TableRow key={notif.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getIcono(notif.tipo)}</span>
                      <span className="text-xs capitalize">{notif.tipo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-sm">{notif.destinatario}</p>
                    <p className="text-xs text-gray-500">{notif.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{notif.asunto}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">
                      {new Date(notif.fecha).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={notif.estado === 'enviado' ? 'success' : 'danger'}>
                      {notif.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
