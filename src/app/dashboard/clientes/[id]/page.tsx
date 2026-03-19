"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { useClientes } from '@/hooks/useClientes';
import { useReservas } from '@/hooks/useReservas';
import { useVehiculos } from '@/hooks/useVehiculos';
import { buildClienteHistorialStats } from '@/hooks/clienteHistorial.utils';
import { ClienteIncidente } from '@/data/ClientesData';
import toast from 'react-hot-toast';
import { useConfig } from '@/context/ConfigContext';

export default function ClienteDetallePage() {
  const params = useParams<{ id: string }>();
  const clienteId = params.id;

  const { clientes, actualizarCliente } = useClientes();
  const { reservas } = useReservas();
  const { vehiculos } = useVehiculos();
  const { t, highContrast } = useConfig();

  const linkGhost = highContrast
    ? 'bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg text-sm'
    : 'bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm';
  const controlInput = highContrast
    ? 'w-full bg-white border border-gray-300 rounded-lg p-2 text-sm text-black'
    : 'w-full bg-black/30 border border-gray-700 rounded-lg p-2 text-sm text-white';

  const [nuevoIncidente, setNuevoIncidente] = useState({
    tipo: 'multa' as ClienteIncidente['tipo'],
    descripcion: '',
    monto: '',
  });

  const cliente = clientes.find((item) => item.id === clienteId);

  const stats = useMemo(() => {
    if (!cliente) {
      return null;
    }

    return buildClienteHistorialStats(cliente, reservas, vehiculos);
  }, [cliente, reservas, vehiculos]);

  if (!cliente || !stats) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{t('clienteDetalle', 'notFound')}</h1>
          <Link href="/dashboard/clientes" className="text-[#00E5FF] underline">{t('clienteDetalle', 'volverListado')}</Link>
        </div>
      </MainLayout>
    );
  }

  const addIncidente = () => {
    if (!nuevoIncidente.descripcion.trim()) {
      toast.error(t('clienteDetalle', 'errorIncidente'));
      return;
    }

    const incidente: ClienteIncidente = {
      id: `inc-${Date.now()}`,
      tipo: nuevoIncidente.tipo,
      descripcion: nuevoIncidente.descripcion,
      fecha: new Date().toISOString().split('T')[0],
      monto: nuevoIncidente.monto ? Number(nuevoIncidente.monto) : undefined,
    };

    actualizarCliente(cliente.id, {
      incidentes: [...(cliente.incidentes ?? []), incidente],
    });

    setNuevoIncidente({ tipo: 'multa', descripcion: '', monto: '' });
    toast.success(t('clienteDetalle', 'successIncidente'));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-black italic uppercase">{t('clienteDetalle', 'ficha')}</h1>
            <p className="text-gray-400">{cliente.nombre} · {cliente.numeroDocumento}</p>
          </div>
          <Link href="/dashboard/clientes" className={linkGhost}>{t('clienteDetalle', 'volver')}</Link>
        </div>

        {stats.riesgoAlto && (
          <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-4" role="alert" aria-live="polite">
            <p className="font-bold text-red-400">{t('clienteDetalle', 'riesgoTitle')}</p>
            <p className="text-sm text-red-200">{t('clienteDetalle', 'riesgoDesc')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase">{t('clienteDetalle', 'ltv')}</p>
            <p className="text-2xl font-black text-[#00E5FF]">${stats.ltv.toLocaleString()}</p>
          </div>
          <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase">{t('clienteDetalle', 'reservasTotales')}</p>
            <p className="text-2xl font-black">{stats.reservasTotales}</p>
          </div>
          <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase">{t('clienteDetalle', 'reservasActivas')}</p>
            <p className="text-2xl font-black">{stats.reservasActivas}</p>
          </div>
          <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase">{t('clienteDetalle', 'multasDanos')}</p>
            <p className="text-2xl font-black text-orange-400">${stats.totalMultas.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-5">
            <h2 className="font-bold mb-3">{t('clienteDetalle', 'topVehiculos')}</h2>
            <div className="space-y-2">
              {stats.topVehiculos.length === 0 && <p className="text-sm text-gray-400">{t('clienteDetalle', 'sinHistorico')}</p>}
              {stats.topVehiculos.map((item) => (
                <div key={item.vehiculoId} className="flex justify-between border border-gray-700 rounded-lg p-3">
                  <p>{item.nombre}</p>
                  <p className="font-bold">{item.cantidad}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="font-bold">{t('clienteDetalle', 'incidentesTitle')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="tipoIncidente" className="block text-xs text-gray-400 mb-1">{t('clienteDetalle', 'tipo')}</label>
                <select
                  id="tipoIncidente"
                  value={nuevoIncidente.tipo}
                  onChange={(event) => setNuevoIncidente((prev) => ({ ...prev, tipo: event.target.value as ClienteIncidente['tipo'] }))}
                  className={controlInput}
                >
                  <option value="multa">{t('clienteDetalle', 'multa')}</option>
                  <option value="dano">{t('clienteDetalle', 'dano')}</option>
                  <option value="retraso">{t('clienteDetalle', 'retraso')}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="descripcionIncidente" className="block text-xs text-gray-400 mb-1">{t('clienteDetalle', 'descripcion')}</label>
                <input
                  id="descripcionIncidente"
                  value={nuevoIncidente.descripcion}
                  onChange={(event) => setNuevoIncidente((prev) => ({ ...prev, descripcion: event.target.value }))}
                  className={controlInput}
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="w-full max-w-40">
                <label htmlFor="montoIncidente" className="block text-xs text-gray-400 mb-1">{t('clienteDetalle', 'montoOpcional')}</label>
                <input
                  id="montoIncidente"
                  type="number"
                  min={0}
                  value={nuevoIncidente.monto}
                  onChange={(event) => setNuevoIncidente((prev) => ({ ...prev, monto: event.target.value }))}
                  className={controlInput}
                />
              </div>
              <button type="button" onClick={addIncidente} className="bg-[#00E5FF] text-black font-bold px-4 py-2 rounded-lg">{t('clienteDetalle', 'agregar')}</button>
            </div>

            <div className="space-y-2">
              {stats.incidentes.length === 0 && <p className="text-sm text-gray-400">{t('clienteDetalle', 'sinIncidentes')}</p>}
              {stats.incidentes.map((incidente) => (
                <div key={incidente.id} className="border border-gray-700 rounded-lg p-3 text-sm">
                  <p className="font-bold capitalize">{incidente.tipo}</p>
                  <p className="text-gray-400">{incidente.descripcion}</p>
                  <p className="text-gray-500 text-xs mt-1">{incidente.fecha}{incidente.monto ? ` · $${incidente.monto}` : ''}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
