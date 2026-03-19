"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { CHECKLIST_DEFAULT, ChecklistEstado, TipoInspeccion } from '@/data/HU2_CheckinData';
import { useCheckins } from '@/hooks/useCheckins';
import { useReservas } from '@/hooks/useReservas';
import { useVehiculos } from '@/hooks/useVehiculos';
import { generateDamageReportPDF } from '@/services/checkinReportService';
import { useConfig } from '@/context/ConfigContext';
import toast from 'react-hot-toast';

export default function CheckInOutPage() {
  const { reservas } = useReservas();
  const { vehiculos } = useVehiculos();
  const { inspecciones, saveInspection, getInspectionPair } = useCheckins();
  const { t } = useConfig();

  const [reservaId, setReservaId] = useState('');
  const [tipo, setTipo] = useState<TipoInspeccion>('check-in');
  const [kilometraje, setKilometraje] = useState('0');
  const [nivelCombustible, setNivelCombustible] = useState('100');
  const [fotosInput, setFotosInput] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [checklist, setChecklist] = useState<ChecklistEstado>(CHECKLIST_DEFAULT);
  const [formMessage, setFormMessage] = useState('');

  const reservasDisponibles = useMemo(
    () => reservas.filter((reserva) => reserva.estado !== 'cancelada'),
    [reservas],
  );

  const reservaSeleccionada = reservasDisponibles.find((reserva) => reserva.id === reservaId);
  const vehiculoSeleccionado = vehiculos.find((vehiculo) => vehiculo.id === reservaSeleccionada?.vehiculoId);

  const handleChecklist = (key: keyof ChecklistEstado, value: boolean) => {
    setChecklist((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setKilometraje('0');
    setNivelCombustible('100');
    setFotosInput('');
    setObservaciones('');
    setChecklist(CHECKLIST_DEFAULT);
  };

  const handleSave = () => {
    if (!reservaSeleccionada || !vehiculoSeleccionado) {
      setFormMessage(t('checkin', 'errorReserva'));
      toast.error(t('checkin', 'errorReserva'));
      return;
    }

    try {
      const saved = saveInspection({
        reservaId: reservaSeleccionada.id,
        vehiculoId: vehiculoSeleccionado.id,
        tipo,
        kilometraje: Number(kilometraje),
        nivelCombustible: Number(nivelCombustible),
        checklist,
        fotos: fotosInput.split(',').map((foto) => foto.trim()),
        observaciones,
      });

      if (tipo === 'check-out') {
        const { checkIn } = getInspectionPair(reservaSeleccionada.id);
        generateDamageReportPDF({
          reserva: reservaSeleccionada,
          vehiculo: vehiculoSeleccionado,
          checkIn,
          checkOut: saved,
        });
      }

      setFormMessage(t('checkin', 'successGuardado'));
      toast.success(t('checkin', 'successGuardado'));
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('checkin', 'errorGuardado');
      setFormMessage(message);
      toast.error(message);
    }
  };

  return (
    <MainLayout>
      <p role="status" aria-live="assertive" className="sr-only">{formMessage}</p>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-3xl font-black italic uppercase">{t('checkin', 'title')}</h1>
            <p className="text-gray-500">{t('checkin', 'subtitle')}</p>
          </div>

          <Link href="/dashboard/reservas" className="bg-white/10 px-4 py-2 rounded-lg text-sm">{t('checkin', 'volverReservas')}</Link>
        </div>

        <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="reserva" className="block text-xs text-gray-400 mb-1">{t('checkin', 'reserva')}</label>
              <select id="reserva" value={reservaId} onChange={(e) => setReservaId(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm">
                <option value="">{t('checkin', 'seleccionar')}</option>
                {reservasDisponibles.map((reserva) => (
                  <option key={reserva.id} value={reserva.id}>{reserva.id} - {reserva.cliente}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tipo" className="block text-xs text-gray-400 mb-1">{t('checkin', 'tipoRegistro')}</label>
              <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoInspeccion)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm">
                <option value="check-in">Check-in</option>
                <option value="check-out">Check-out</option>
              </select>
            </div>

            <div className="text-sm">
              <p className="text-xs text-gray-400">{t('checkin', 'vehiculo')}</p>
              <p className="font-bold mt-2">{vehiculoSeleccionado ? `${vehiculoSeleccionado.marca} ${vehiculoSeleccionado.modelo}` : t('checkin', 'sinSeleccionar')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kilometraje" className="block text-xs text-gray-400 mb-1">{t('checkin', 'kilometraje')}</label>
              <input id="kilometraje" type="number" min={0} value={kilometraje} onChange={(e) => setKilometraje(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" />
            </div>

            <div>
              <label htmlFor="combustible" className="block text-xs text-gray-400 mb-1">{t('checkin', 'combustible')}</label>
              <input id="combustible" type="number" min={0} max={100} value={nivelCombustible} onChange={(e) => setNivelCombustible(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">{t('checkin', 'checklist')}</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(Object.keys(checklist) as Array<keyof ChecklistEstado>).map((item) => (
                <label key={item} className="flex items-center gap-2 bg-black/30 p-2 rounded text-sm">
                  <input type="checkbox" checked={checklist[item]} onChange={(e) => handleChecklist(item, e.target.checked)} />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fotos" className="block text-xs text-gray-400 mb-1">{t('checkin', 'fotos')}</label>
            <input id="fotos" value={fotosInput} onChange={(e) => setFotosInput(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm" placeholder="https://...jpg, https://...png" />
          </div>

          <div>
            <label htmlFor="observaciones" className="block text-xs text-gray-400 mb-1">{t('checkin', 'observaciones')}</label>
            <textarea id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-lg p-2 text-sm min-h-24" />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={handleSave} className="bg-[#00E5FF] text-black font-bold px-4 py-2 rounded-lg">
              {t('checkin', 'guardar')} {tipo}
            </button>
          </div>
        </div>

        <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold mb-3">{t('checkin', 'historial')}</h2>
          <div className="space-y-2">
            {inspecciones.length === 0 && <p className="text-sm text-gray-400">{t('checkin', 'sinInspecciones')}</p>}
            {inspecciones.slice().reverse().map((inspection) => (
              <div key={inspection.id} className="border border-gray-700 rounded-lg p-3 text-sm">
                <p className="font-bold">{inspection.tipo.toUpperCase()} · {inspection.reservaId}</p>
                <p className="text-gray-400">{t('checkin', 'kmAbbr')}: {inspection.kilometraje} · {t('checkin', 'combustibleAbbr')}: {inspection.nivelCombustible}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
