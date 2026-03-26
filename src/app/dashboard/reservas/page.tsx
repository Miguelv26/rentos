"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useReservas } from '@/hooks/useReservas';
import { useClientes } from '@/hooks/useClientes';
import { useConfig } from '@/context/ConfigContext';
import { Vehiculo } from '@/data/HU1_VehiculosData';
import { MetodoPago, TarifaExtra, TarifasIniciales } from '@/data/HU3_ReservasData';
import { calculateReservationAmounts, calculateReservationDays, isLicenseValidForDate } from '@/hooks/reservas.utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ReservasPage() {
  const { vehiculos, setVehiculos } = useVehiculos(); 
  const { reservas, crearReserva, verificarDisponibilidad: verificarDisponibilidadReserva } = useReservas();
  const { clientes } = useClientes();
  const { highContrast, t } = useConfig();

  const [tarifasExtras, setTarifasExtras] = useState<TarifaExtra[]>(TarifasIniciales);
  
  const [fechas, setFechas] = useState({ 
    inicio: new Date().toISOString().split('T')[0], 
    fin: new Date(Date.now() + 86400000).toISOString().split('T')[0] 
  });
  
  const [motoSeleccionada, setMotoSeleccionada] = useState<Vehiculo | null>(null);
  const [clienteQuery, setClienteQuery] = useState('');
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [nuevaTarifa, setNuevaTarifa] = useState({ nombre: '', precio: 0, esPorDia: true });
  const [formMessage, setFormMessage] = useState('');
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLElement | null>(null);

  const clientesFiltrados = useMemo(() => {
    const query = clienteQuery.trim().toLowerCase();
    if (!query) {
      return clientes.slice(0, 8);
    }

    return clientes
      .filter((cliente) =>
        cliente.nombre.toLowerCase().includes(query) || cliente.numeroDocumento.toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [clienteQuery, clientes]);

  const clienteSeleccionado = clientes.find((cliente) => cliente.id === clienteSeleccionadoId);

  const esMotoDisponible = (moto: Vehiculo) => {
    if (moto.estado === 'maintenance') {
      return false;
    }

    return verificarDisponibilidadReserva(moto.id, fechas.inicio, fechas.fin);
  };

  const motosDisponibles = vehiculos.filter(esMotoDisponible);

  const calcularDias = () => {
    return calculateReservationDays(fechas.inicio, fechas.fin);
  };

  const calcularDesglose = (precioDiaMoto: number) => {
    const dias = calcularDias();
    let totalExtras = 0;
    tarifasExtras.forEach(t => {
      totalExtras += t.esPorDia ? (t.precio * dias) : t.precio;
    });
    const { subtotalRenta, total, deposito } = calculateReservationAmounts(precioDiaMoto, dias, totalExtras);
    return { dias, subtotalRenta, totalExtras, granTotal: total, deposito };
  };

  const agregarTarifa = () => {
    if (!nuevaTarifa.nombre || nuevaTarifa.precio <= 0) return;
    setTarifasExtras([...tarifasExtras, { ...nuevaTarifa, id: Date.now().toString() }]);
    setNuevaTarifa({ nombre: '', precio: 0, esPorDia: true });
  };

  const eliminarTarifa = (id: string) => {
    setTarifasExtras(tarifasExtras.filter(t => t.id !== id));
  };

  const confirmarReserva = () => {
    if (!motoSeleccionada) {
      setFormMessage(t('reservas', 'errorSeleccionVehiculo'));
      toast.error(t('reservas', 'errorSeleccionVehiculo'));
      return;
    }

    if (!clienteSeleccionado) {
      setFormMessage(t('reservas', 'errorSeleccionCliente'));
      toast.error(t('reservas', 'errorSeleccionCliente'));
      return;
    }

    if (!isLicenseValidForDate(clienteSeleccionado, fechas.inicio)) {
      setFormMessage(t('reservas', 'errorLicencia'));
      toast.error(t('reservas', 'errorLicencia'));
      return;
    }

    if (!verificarDisponibilidadReserva(motoSeleccionada.id, fechas.inicio, fechas.fin)) {
      setFormMessage(t('reservas', 'errorSolapamiento'));
      toast.error(t('reservas', 'errorSolapamiento'));
      return;
    }

    const desglose = calcularDesglose(motoSeleccionada.precioDia);

    crearReserva({
      vehiculoId: motoSeleccionada.id,
      cliente: clienteSeleccionado.nombre,
      documento: clienteSeleccionado.numeroDocumento,
      fechaInicio: fechas.inicio,
      fechaFin: fechas.fin,
      desglose: {
        dias: desglose.dias,
        precioDia: motoSeleccionada.precioDia,
        totalExtras: desglose.totalExtras,
        deposito: desglose.deposito,
      },
      totalFinal: desglose.granTotal,
      estado: 'confirmada',
      pago: {
        metodoPago,
        estado: 'procesado',
        fechaOperacion: fechas.inicio,
        referencia: `TXN-${Date.now()}`,
      }
    });

    const hoy = new Date().toISOString().split('T')[0];
    if (fechas.inicio === hoy) {
      const nuevaFlota = vehiculos.map(v => 
        v.id === motoSeleccionada.id ? { ...v, estado: 'rented' as const } : v
      );
      setVehiculos(nuevaFlota);
    }

    setMotoSeleccionada(null);
    setClienteQuery('');
    setClienteSeleccionadoId('');
    setMetodoPago('efectivo');
    setFormMessage(t('reservas', 'successReserva'));
    toast.success(t('reservas', 'successReserva'));
  };

  useEffect(() => {
    if (!motoSeleccionada) {
      return;
    }

    const previousFocused = document.activeElement as HTMLElement | null;
    triggerButtonRef.current = previousFocused;

    const raf = requestAnimationFrame(() => {
      confirmDialogRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMotoSeleccionada(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [motoSeleccionada]);

  const themeCard = highContrast ? 'bg-white border-gray-300 text-black' : 'bg-[#1E1E1E] border-gray-800 text-white';
  const themeInput = highContrast
    ? 'w-full bg-white border border-gray-300 rounded-xl p-3 text-xs outline-none focus:border-[#00E5FF] text-black'
    : 'w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-xs outline-none focus:border-[#00E5FF] text-white';
  const themeMuted = highContrast ? 'text-gray-600' : 'text-gray-500';
  const themeSoftPanel = highContrast ? 'bg-gray-100 border-gray-300' : 'bg-white/5 border-gray-700';
  const themeListPanel = highContrast ? 'bg-gray-100 border-gray-300' : 'bg-white/5 border-white/5';
  const themeActionGhost = highContrast
    ? 'text-[10px] font-black bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-black transition'
    : 'text-[10px] font-black bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white transition';
  const themeShortcut = highContrast
    ? 'bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider'
    : 'bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider';
  const themeStrongText = highContrast ? 'text-black' : 'text-white';
  const themeVehicleCard = highContrast
    ? 'border-gray-300 bg-white hover:border-gray-400'
    : 'border-gray-800 bg-[#1E1E1E] hover:border-gray-600';
  const themeVehicleCardSelected = highContrast ? 'border-[#00E5FF] bg-cyan-50' : 'border-[#00E5FF] bg-[#00E5FF]/5';

  return (
    <MainLayout>
      <p role="status" aria-live="assertive" className="sr-only">{formMessage}</p>
      <div className="mb-8">
        <div className="flex flex-wrap justify-between gap-3 items-center">
          <div>
            <h2 className="text-3xl font-black italic uppercase italic">📅 {t('reservas', 'title')}</h2>
            <p className="text-gray-500">{t('reservas', 'subtitle')}</p>
          </div>
          <Link href="/dashboard/reservas/check-in" className={themeShortcut}>
            {t('reservas', 'checkinShortcut')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-6">
          
          <div className={`p-6 rounded-3xl border ${themeCard}`}>
            <h3 className="font-black uppercase text-[#00E5FF] mb-4 text-sm tracking-widest">{t('reservas', 'periodoTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="reserva-fecha-inicio" className="text-[10px] uppercase font-bold text-gray-500">{t('reservas', 'fechaRetiro')}</label>
                <input id="reserva-fecha-inicio" type="date" value={fechas.inicio} className={themeInput} onChange={(e) => setFechas({...fechas, inicio: e.target.value})} />
              </div>
              <div>
                <label htmlFor="reserva-fecha-fin" className="text-[10px] uppercase font-bold text-gray-500">{t('reservas', 'fechaDevolucion')}</label>
                <input id="reserva-fecha-fin" type="date" value={fechas.fin} className={themeInput} onChange={(e) => setFechas({...fechas, fin: e.target.value})} />
              </div>
              <div className={`p-3 rounded-xl border border-dashed text-center ${themeSoftPanel}`}>
                <span className={`text-2xl font-black ${themeStrongText}`}>{calcularDias()}</span>
                <span className="text-[10px] uppercase text-gray-500 block font-bold">{t('reservas', 'diasTotales')}</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border ${themeCard}`}>
            <h3 className="font-black uppercase text-[#00E5FF] mb-4 text-sm tracking-widest">{t('reservas', 'tarifasTitle')}</h3>
            
            <div className="space-y-2 mb-6">
              {tarifasExtras.map((tarifa) => (
                <div key={tarifa.id} className={`flex justify-between items-center p-3 rounded-lg border group hover:border-red-500/30 transition ${themeListPanel}`}>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${highContrast ? 'text-gray-700' : 'text-gray-300'}`}>{tarifa.nombre}</p>
                    <p className="text-[9px] text-gray-500 uppercase">{tarifa.esPorDia ? t('reservas', 'precioPorDia') : t('reservas', 'precioFijo')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-[#00E5FF] font-bold text-xs">+${tarifa.precio}</p>
                    <button 
                      onClick={() => eliminarTarifa(tarifa.id)}
                      className="w-6 h-6 rounded bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition"
                      aria-label={`${t('reservas', 'cancelar')} ${tarifa.nombre}`}
                      title={t('reservas', 'cancelar')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {tarifasExtras.length === 0 && <p className="text-xs text-gray-500 text-center italic">{t('reservas', 'sinTarifas')}</p>}
            </div>

            <div className={`pt-4 border-t ${highContrast ? 'border-gray-300' : 'border-gray-800'}`}>
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t('reservas', 'crearCargo')}</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input 
                  id="nueva-tarifa-nombre"
                  placeholder={t('reservas', 'nombre')} className={themeInput}
                  value={nuevaTarifa.nombre} onChange={(e) => setNuevaTarifa({...nuevaTarifa, nombre: e.target.value})}
                />
                <input 
                  id="nueva-tarifa-precio"
                  type="number" placeholder="$" className={themeInput}
                  value={nuevaTarifa.precio || ''} onChange={(e) => setNuevaTarifa({...nuevaTarifa, precio: Number(e.target.value)})}
                />
              </div>
              <div className="flex justify-between items-center mb-3">
                <label className={`text-[10px] flex items-center gap-2 cursor-pointer ${highContrast ? 'text-gray-700' : 'text-gray-400'}`}>
                  <input type="checkbox" checked={nuevaTarifa.esPorDia} onChange={(e) => setNuevaTarifa({...nuevaTarifa, esPorDia: e.target.checked})} />
                  {t('reservas', 'cobrarPorDia')}
                </label>
                <button onClick={agregarTarifa} className={themeActionGhost}>{t('reservas', 'agregar')}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black uppercase text-gray-500 text-xs tracking-widest">
              {t('reservas', 'vehiculosDisponibles')} ({motosDisponibles.length})
            </h3>
            <p className={`text-[10px] italic ${themeMuted}`}>
              {t('reservas', 'rango')}: {fechas.inicio} ➔ {fechas.fin}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {motosDisponibles.length > 0 ? (
              motosDisponibles.map(moto => (
                <button
                  type="button"
                  key={moto.id}
                  onClick={() => setMotoSeleccionada(moto)}
                  aria-pressed={motoSeleccionada?.id === moto.id}
                  aria-label={`${moto.marca} ${moto.modelo}, ${t('reservas', 'precioPorDia')}: ${moto.precioDia}`}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 overflow-hidden group hover:scale-[1.02] duration-300 text-left ${
                    motoSeleccionada?.id === moto.id ? themeVehicleCardSelected : themeVehicleCard
                  }`}
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <img src={moto.foto} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-[#00E5FF] font-black uppercase tracking-widest">{moto.marca}</p>
                        <h4 className="font-black uppercase italic text-lg leading-none mb-1">{moto.modelo}</h4>
                        <p className="text-[10px] text-gray-500 font-bold bg-white/5 inline-block px-2 py-0.5 rounded">{moto.tipo}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${themeStrongText}`}>${moto.precioDia}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-bold">/ {t('reservas', 'precioPorDia')}</p>
                      </div>
                    </div>
                  </div>
                  {motoSeleccionada?.id === moto.id && (
                    <div className="absolute inset-0 border-2 border-[#00E5FF] rounded-2xl pointer-events-none flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                      <span className="bg-[#00E5FF] text-black font-black px-4 py-2 rounded-full text-xs uppercase shadow-[0_0_20px_rgba(0,229,255,0.6)]">{t('reservas', 'seleccionada')}</span>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('reservas', 'sinDisponibilidad')}</p>
                <p className="text-xs text-gray-600 mt-2">{t('reservas', 'sinDisponibilidadHint')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {motoSeleccionada && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div
            ref={confirmDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('reservas', 'confirmarRenta')}
            tabIndex={-1}
            className={`w-full max-w-lg p-0 rounded-3xl overflow-hidden border ${themeCard}`}
          >
            
            <div className="bg-[#00E5FF] p-6 text-black">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t('reservas', 'confirmarRenta')}</h3>
              <p className="text-xs font-bold opacity-70 uppercase">{t('reservas', 'ticketReserva')}</p>
            </div>

            <div className="p-8 space-y-6">
              
              <div className={`flex gap-4 items-center pb-6 border-b ${highContrast ? 'border-gray-300' : 'border-gray-800'}`}>
                <img src={motoSeleccionada.foto} className="w-16 h-16 rounded-full object-cover border-2 border-[#00E5FF]" />
                <div>
                  <h4 className="font-black text-lg uppercase">{motoSeleccionada.modelo}</h4>
                  <p className="text-xs text-gray-500 uppercase font-bold">{motoSeleccionada.placa}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">{t('reservas', 'periodo')}</p>
                  <p className={`text-sm font-bold ${themeStrongText}`}>{fechas.inicio} <span className="text-[#00E5FF]">➜</span> {fechas.fin}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clienteBusqueda" className="text-[10px] font-bold text-gray-500 uppercase">{t('reservas', 'buscarCliente')}</label>
                  <input
                    id="clienteBusqueda"
                    placeholder={t('reservas', 'buscarClientePlaceholder')}
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-sm outline-none focus:border-[#00E5FF] transition-colors"
                    value={clienteQuery}
                    onChange={(e) => setClienteQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="clienteSeleccionado" className="text-[10px] font-bold text-gray-500 uppercase">{t('reservas', 'clienteSistema')}</label>
                  <select
                    id="clienteSeleccionado"
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-sm outline-none focus:border-[#00E5FF] transition-colors"
                    value={clienteSeleccionadoId}
                    onChange={(event) => setClienteSeleccionadoId(event.target.value)}
                  >
                    <option value="">{t('reservas', 'seleccionarCliente')}</option>
                    {clientesFiltrados.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre} ({item.numeroDocumento})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {clienteSeleccionado && (
                <div className={`rounded-xl p-4 border text-xs ${highContrast ? 'bg-gray-100 border-gray-300' : 'bg-white/5 border-white/10'}`}>
                  <p className={highContrast ? 'text-gray-700' : 'text-gray-400'}>{t('reservas', 'licencia')}: <span className={`${themeStrongText} font-bold`}>{clienteSeleccionado.licencia.numero}</span></p>
                  <p className={`mt-1 ${highContrast ? 'text-gray-700' : 'text-gray-400'}`}>{t('reservas', 'vencimiento')}: <span className={`${themeStrongText} font-bold`}>{clienteSeleccionado.licencia.fechaVencimiento}</span></p>
                  <p className={`mt-2 font-bold ${isLicenseValidForDate(clienteSeleccionado, fechas.inicio) ? 'text-green-400' : 'text-red-400'}`}>
                    {isLicenseValidForDate(clienteSeleccionado, fechas.inicio)
                      ? t('reservas', 'licenciaValida')
                      : t('reservas', 'licenciaInvalida')}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="metodoPago" className="text-[10px] font-bold text-gray-500 uppercase">{t('reservas', 'metodoPago')}</label>
                <select
                  id="metodoPago"
                  className="w-full mt-2 bg-transparent border-b border-gray-700 py-2 text-sm outline-none focus:border-[#00E5FF] transition-colors"
                  value={metodoPago}
                  onChange={(event) => setMetodoPago(event.target.value as MetodoPago)}
                >
                  <option value="efectivo">{t('reservas', 'efectivo')}</option>
                  <option value="tarjeta_credito">{t('reservas', 'tarjetaCredito')}</option>
                  <option value="tarjeta_debito">{t('reservas', 'tarjetaDebito')}</option>
                  <option value="transferencia">{t('reservas', 'transferencia')}</option>
                  <option value="billetera">{t('reservas', 'billetera')}</option>
                </select>
              </div>

              <div className={`rounded-xl p-5 border space-y-2 font-mono text-sm ${highContrast ? 'bg-gray-100 border-gray-300' : 'bg-white/5 border-white/5'}`}>
                <div className={`flex justify-between text-xs uppercase font-bold mb-2 ${highContrast ? 'text-gray-700' : 'text-gray-400'}`}>
                  <span>{t('reservas', 'concepto')}</span><span>{t('reservas', 'subtotal')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{t('reservas', 'rentaXDias')} {calcularDesglose(motoSeleccionada.precioDia).dias}</span>
                  <span>${calcularDesglose(motoSeleccionada.precioDia).subtotalRenta}</span>
                </div>

                {tarifasExtras.map((tarifa) => (
                  <div key={tarifa.id} className={`flex justify-between text-xs ${highContrast ? 'text-gray-700' : 'text-gray-400'}`}>
                    <span>+ {tarifa.nombre} {tarifa.esPorDia && `(x${calcularDias()})`}</span>
                    <span>${tarifa.esPorDia ? tarifa.precio * calcularDias() : tarifa.precio}</span>
                  </div>
                ))}

                <div className="border-t border-dashed border-gray-600 my-3 pt-3 flex justify-between items-center">
                  <span className="font-black text-lg uppercase italic text-[#00E5FF]">{t('reservas', 'deposito')}</span>
                  <span className={`font-black text-xl ${themeStrongText}`}>${calcularDesglose(motoSeleccionada.precioDia).deposito}</span>
                </div>

                <div className="border-t border-dashed border-gray-600 my-3 pt-3 flex justify-between items-center">
                  <span className="font-black text-lg uppercase italic text-[#00E5FF]">{t('reservas', 'totalPagar')}</span>
                  <span className={`font-black text-2xl ${themeStrongText}`}>${calcularDesglose(motoSeleccionada.precioDia).granTotal}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setMotoSeleccionada(null)} className="flex-1 py-4 text-xs font-bold uppercase text-gray-500 hover:bg-white/5 rounded-xl transition">{t('reservas', 'cancelar')}</button>
                <button onClick={confirmarReserva} className="flex-[2] bg-[#00E5FF] text-black py-4 rounded-xl font-black text-xs uppercase shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all">
                  {t('reservas', 'confirmarReserva')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}