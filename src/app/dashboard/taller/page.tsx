"use client";
import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConfig } from '@/context/ConfigContext'; 
import { Vehiculo, RegistroMantenimiento } from '@/data/HU1_VehiculosData';

export default function TallerPage() {
  const { vehiculos, setVehiculos } = useVehiculos();
  const { t, highContrast } = useConfig(); 

  const [mostrarNuevoMant, setMostrarNuevoMant] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [motoAFinalizar, setMotoAFinalizar] = useState<Vehiculo | null>(null);
  
  const [ingresoData, setIngresoData] = useState({ 
    id: 0, 
    tipo: 'Preventivo', 
    tarea: '', 
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '' 
  });
  const [servicioData, setServicioData] = useState({ costo: 0 });
  const [filtroHistorial, setFiltroHistorial] = useState("");

  const vehiculosEnRevision = vehiculos.filter(v => 
    v.estado === 'maintenance' || v.proximoMantenimiento <= 500
  );
  const motosDisponibles = vehiculos.filter(v => v.estado === 'available');

  const registrarIngreso = () => {
    if (ingresoData.id === 0 || !ingresoData.tarea || !ingresoData.fechaFin) {
      alert("Por favor completa todos los campos, incluyendo las fechas.");
      return;
    }
    const nuevaLista = vehiculos.map(v => 
      v.id === ingresoData.id ? { 
        ...v, 
        estado: 'maintenance' as const,
        tareaPendiente: `${ingresoData.tipo}: ${ingresoData.tarea}`,
        periodoMantenimiento: { inicio: ingresoData.fechaInicio, fin: ingresoData.fechaFin }
      } : v
    );
    setVehiculos(nuevaLista);
    setMostrarNuevoMant(false);
    setIngresoData({ id: 0, tipo: 'Preventivo', tarea: '', fechaInicio: new Date().toISOString().split('T')[0], fechaFin: '' });
  };

  const finalizarServicio = () => {
    if (!motoAFinalizar) return;
    const infoActual = (motoAFinalizar as any);
    const [tipo, ...desc] = infoActual.tareaPendiente?.split(': ') || ['Preventivo', 'Mantenimiento General'];
    
    const nuevoRegistro: RegistroMantenimiento = {
      id: Date.now().toString(),
      fecha: `${infoActual.periodoMantenimiento?.inicio} al ${new Date().toISOString().split('T')[0]}`,
      descripcion: desc.join(': '),
      costo: servicioData.costo,
      tipo: tipo as 'Correctivo' | 'Preventivo'
    };

    const nuevaLista = vehiculos.map(v => {
      if (v.id === motoAFinalizar.id) {
        const { tareaPendiente, periodoMantenimiento, ...resto } = v as any;
        return {
          ...resto,
          estado: 'available' as const,
          proximoMantenimiento: 2500, 
          historial: [...(v.historial || []), nuevoRegistro]
        };
      }
      return v;
    });

    setVehiculos(nuevaLista);
    setMotoAFinalizar(null);
  };

  const themeCard = highContrast ? 'bg-white border-gray-300 text-black' : 'bg-[#1E1E1E] border-gray-800 text-white';

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase">🛠️ Centro de Servicio</h2>
          <p className={highContrast ? 'text-gray-600' : 'text-gray-400'}>Control de tiempos y costos de reparación</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setMostrarHistorial(true)} className="px-6 py-3 rounded-xl border border-gray-700 font-bold text-xs uppercase hover:bg-white/5 transition">📋 Historial</button>
          <button onClick={() => setMostrarNuevoMant(true)} className="bg-[#00E5FF] hover:bg-cyan-300 text-black font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] text-xs uppercase">+ Registrar Entrada</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehiculosEnRevision.map(moto => {
          const isInTaller = moto.estado === 'maintenance';
          const infoManto = (moto as any);
          
          return (
            <div key={moto.id} className={`flex h-52 rounded-2xl overflow-hidden border ${themeCard} transition-all hover:border-[#00E5FF]/50`}>
              <img src={moto.foto} className="w-36 object-cover grayscale-[0.4]" alt={moto.modelo} />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-[#00E5FF] uppercase">{moto.placa}</p>
                    <h3 className="text-xl font-black uppercase italic leading-tight">{moto.modelo}</h3>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded ${isInTaller ? 'bg-orange-500 text-white' : 'bg-red-500/20 text-red-500'}`}>
                    {isInTaller ? 'EN REPARACIÓN' : 'CRÍTICO'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold uppercase text-gray-500">
                      {isInTaller ? `📅 ${infoManto.periodoMantenimiento?.inicio} ➔ ${infoManto.periodoMantenimiento?.fin}` : '⚠️ Vida Útil'}
                    </p>
                    <p className={`text-[10px] font-black uppercase ${isInTaller ? 'text-orange-400' : 'text-red-400'}`}>
                      {isInTaller ? infoManto.tareaPendiente : `${moto.proximoMantenimiento} KM`}
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isInTaller ? 'bg-orange-500 animate-pulse' : 'bg-red-600'}`}
                      style={{ width: isInTaller ? '75%' : `${(moto.proximoMantenimiento / 2500) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => setMotoAFinalizar(moto)}
                  className="w-full py-2.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF] hover:text-black text-[#00E5FF] rounded-xl text-[10px] font-black uppercase border border-[#00E5FF]/20 transition-all"
                >
                  {isInTaller ? 'Finalizar y Entregar' : 'Ingresar a Box'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {mostrarNuevoMant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-8 rounded-3xl border ${themeCard}`}>
            <h3 className="text-2xl font-black mb-6 uppercase italic text-[#00E5FF]">Programar Ingreso</h3>
            <div className="space-y-4">
              <select 
                className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-sm outline-none"
                onChange={(e) => setIngresoData({...ingresoData, id: Number(e.target.value)})}
              >
                <option value="0">Seleccionar Vehículo...</option>
                {motosDisponibles.map(m => <option key={m.id} value={m.id}>{m.modelo} ({m.placa})</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                  <select className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-sm mt-1 outline-none"
                    onChange={(e) => setIngresoData({...ingresoData, tipo: e.target.value})}>
                    <option value="Preventivo">Preventivo</option>
                    <option value="Correctivo">Correctivo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tarea</label>
                  <input placeholder="Ej: Kit de Arrastre" className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-sm mt-1 outline-none"
                    onChange={(e) => setIngresoData({...ingresoData, tarea: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Ingreso</label>
                  <input type="date" className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-sm mt-1 outline-none"
                    value={ingresoData.fechaInicio}
                    onChange={(e) => setIngresoData({...ingresoData, fechaInicio: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Salida Estimada</label>
                  <input type="date" className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-sm mt-1 outline-none text-[#00E5FF]"
                    onChange={(e) => setIngresoData({...ingresoData, fechaFin: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setMostrarNuevoMant(false)} className="flex-1 py-3 text-xs font-bold uppercase text-gray-500">Cancelar</button>
              <button onClick={registrarIngreso} className="flex-1 bg-[#00E5FF] text-black py-3 rounded-xl font-black text-xs uppercase">Confirmar Orden</button>
            </div>
          </div>
        </div>
      )}

      {mostrarHistorial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl p-8 rounded-3xl border ${themeCard} max-h-[85vh] flex flex-col`}>
            <h3 className="text-2xl font-black mb-6 uppercase italic">Archivo Maestro</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {vehiculos.flatMap(v => (v.historial || []).map(reg => ({...reg, modelo: v.modelo, placa: v.placa})))
                .map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className={`text-[10px] p-2 rounded-lg bg-black/40 font-bold border ${item.tipo === 'Correctivo' ? 'border-red-900 text-red-500' : 'border-green-900 text-green-500'}`}>
                        {item.tipo.substring(0,4)}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#00E5FF] uppercase">{item.placa} • {item.fecha}</p>
                        <p className="text-sm font-bold uppercase">{item.modelo} - {item.descripcion}</p>
                      </div>
                    </div>
                    <p className="font-black text-lg text-white">${item.costo.toLocaleString()}</p>
                  </div>
                ))}
            </div>
            <button onClick={() => setMostrarHistorial(false)} className="mt-6 py-4 bg-[#00E5FF] text-black font-black rounded-2xl uppercase text-xs">Cerrar</button>
          </div>
        </div>
      )}

      {motoAFinalizar && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-8 rounded-3xl border ${themeCard}`}>
            <h3 className="text-xl font-black mb-2 uppercase text-[#00E5FF]">Cerrar Orden</h3>
            <p className="text-xs text-gray-500 mb-6 italic">{(motoAFinalizar as any).tareaPendiente}</p>
            <input 
              type="number" autoFocus placeholder="Costo Total ($)"
              className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-xl font-bold text-white outline-none"
              onChange={(e) => setServicioData({costo: Number(e.target.value)})}
            />
            <button onClick={finalizarServicio} className="w-full bg-[#00E5FF] text-black py-4 rounded-2xl font-black text-xs uppercase mt-8">Dar de Alta</button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}