"use client";
import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useTenants } from '@/hooks/useTenants';
import { useConfig } from '@/context/ConfigContext'; 
import { HU1_VehiculoForm } from '@/components/HU1_VehiculoForm';
import { Vehiculo } from '@/data/HU1_VehiculosData';
import toast from 'react-hot-toast';

export default function Page() {
  const { vehiculos, setVehiculos } = useVehiculos();
  const { activeTenant, canAddVehicleToTenant, incrementVehicleCount, decrementVehicleCount } = useTenants();
  const { t, highContrast } = useConfig(); 

  const [vehiculoAEditar, setVehiculoAEditar] = useState<Vehiculo | null>(null);
  const [vehiculoDetalle, setVehiculoDetalle] = useState<Vehiculo | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const guardarCambios = (vehiculo: Vehiculo) => {
    let nuevaLista;
    if (vehiculo.id === 0) {
      if (!activeTenant) {
        toast.error(t('vehiculosHu', 'errorSeleccionTenant'));
        return;
      }

      const validation = canAddVehicleToTenant(activeTenant.id);
      if (!validation.allowed) {
        toast.error(`${validation.reason}. Límite: ${activeTenant.limiteVehiculos}.`);
        return;
      }

      nuevaLista = [{ ...vehiculo, id: Date.now() }, ...vehiculos];
      incrementVehicleCount(activeTenant.id);
    } else {
      nuevaLista = vehiculos.map(v => v.id === vehiculo.id ? vehiculo : v);
    }
    setVehiculos(nuevaLista); 
    setMostrarFormulario(false);
    setVehiculoAEditar(null);
  };

  const eliminarVehiculo = (id: number) => {
    const nuevaLista = vehiculos.filter(v => v.id !== id);
    setVehiculos(nuevaLista);
    if (activeTenant) {
      decrementVehicleCount(activeTenant.id);
    }
    setMostrarFormulario(false);
    setVehiculoAEditar(null);
    setVehiculoDetalle(null);
  };

  const abrirCreacion = () => {
    setVehiculoAEditar(null); 
    setMostrarFormulario(true);
  };

  const cardStyle = highContrast 
    ? 'bg-white border-2 border-gray-200 shadow-md text-black' 
    : 'bg-[#1E1E1E] border border-gray-800 text-white hover:border-[#00E5FF] shadow-lg';

  const textSecondary = highContrast ? 'text-gray-600' : 'text-gray-400';

  return (
    <MainLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className={`text-3xl font-bold mb-1 ${highContrast ? 'text-black' : 'text-white'}`}>
            {t('home', 'title')}
          </h2>
          <p className={textSecondary}>{t('home', 'subtitle')}</p>
          {activeTenant && (
            <p className="text-xs mt-2 text-[#00E5FF] font-bold uppercase tracking-wider">
              {t('vehiculosHu', 'tenantActivoPrefix')}: {activeTenant.nombreAgencia} · {t('vehiculosHu', 'flota')}: {activeTenant.vehiculosRegistrados}/{activeTenant.limiteVehiculos >= 9999 ? t('vehiculosHu', 'ilimitado') : activeTenant.limiteVehiculos}
            </p>
          )}
        </div>
        
        <button 
          onClick={abrirCreacion}
          className="bg-[#00E5FF] hover:bg-cyan-300 text-black font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
        >
          <span className="text-xl">+</span> {t('vehiculosHu', 'addVehiculo')}
        </button>
      </div>

      {vehiculoDetalle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className={`${highContrast ? 'bg-white text-black' : 'bg-[#121212] text-white'} border ${highContrast ? 'border-gray-400' : 'border-[#00E5FF]/40'} p-0 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}>
            
            <div className="relative h-72 w-full">
              <img src={vehiculoDetalle.foto} alt={vehiculoDetalle.modelo} className="w-full h-full object-cover" />
              <button onClick={() => setVehiculoDetalle(null)} className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${highContrast ? 'bg-white/80 hover:bg-white text-black' : 'bg-black/50 hover:bg-black text-white'}`}>✕</button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#121212] to-transparent h-32"></div>
            </div>
            
            <div className="p-8 -mt-12 relative">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-[#00E5FF] font-black text-sm uppercase tracking-[0.2em]">{vehiculoDetalle.marca}</span>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{vehiculoDetalle.modelo}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">{t('vehiculosHu', 'costoRenta')}</p>
                  <p className="text-4xl font-bold text-[#00E5FF]">${vehiculoDetalle.precioDia}<span className="text-sm text-gray-500 font-normal">/día</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: t('vehiculosHu', 'placa'), value: vehiculoDetalle.placa, icon: '🆔' },
                  { label: t('vehiculosHu', 'recorrido'), value: `${vehiculoDetalle.kilometraje.toLocaleString()} km`, icon: '📍' },
                  { label: t('vehiculosHu', 'anio'), value: vehiculoDetalle.anio, icon: '📅' },
                  { label: t('vehiculosHu', 'tipo'), value: vehiculoDetalle.tipo, icon: '🏍️' }
                ].map((spec, idx) => (
                  <div key={idx} className={`${highContrast ? 'bg-gray-100 border-gray-300' : 'bg-white/5 border-white/10'} p-4 rounded-2xl border`}>
                    <p className="text-[10px] uppercase text-gray-500 font-black mb-1">{spec.label}</p>
                    <p className="font-bold text-sm flex items-center gap-2">{spec.icon} {spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setVehiculoDetalle(null); setVehiculoAEditar(vehiculoDetalle); setMostrarFormulario(true); }}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all border active:scale-95 ${highContrast ? 'bg-gray-100 hover:bg-gray-200 border-gray-300' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
                >
                  {t('vehiculosHu', 'editarFicha')}
                </button>
                <button onClick={() => setVehiculoDetalle(null)} className="flex-1 bg-[#00E5FF] hover:bg-cyan-300 text-black py-4 rounded-2xl font-extrabold transition-all shadow-[0_10px_20px_rgba(0,229,255,0.2)] active:scale-95">
                  {t('vehiculosHu', 'cerrar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <HU1_VehiculoForm 
          vehiculo={vehiculoAEditar} 
          onSave={guardarCambios} 
          onCancel={() => setMostrarFormulario(false)} 
          onDelete={eliminarVehiculo}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {vehiculos.map((moto) => (
          <div key={moto.id} className={`rounded-xl overflow-hidden transition-all duration-300 group ${cardStyle}`}>
            <div className="h-48 overflow-hidden relative">
              <img src={moto.foto} alt={moto.modelo} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">{moto.placa}</div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[#00E5FF] text-[10px] font-bold uppercase mb-1">{moto.marca}</p>
                  <h3 className="text-lg font-bold leading-tight">{moto.modelo}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  moto.estado === 'available' ? 'bg-green-500/20 text-green-400' : 
                  moto.estado === 'maintenance' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {t('status', moto.estado)}
                </span>
              </div>
              
              <div className={`text-sm mb-4 space-y-2 ${textSecondary}`}>
                <p><span className="font-medium">{t('card', 'km')}:</span> {moto.kilometraje.toLocaleString()} km</p>
                <p>🔧 <span className="font-medium">{t('vehiculosHu', 'mantenimiento')}:</span> en {moto.proximoMantenimiento} km</p>             
              </div>

              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => setVehiculoDetalle(moto)}
                  className="flex-1 bg-[#00E5FF] text-black font-bold py-2 rounded-lg text-sm hover:bg-cyan-300 transition-colors shadow-sm"
                >
                  {t('card', 'btn_details')}
                </button>
                <button 
                  onClick={() => { setVehiculoAEditar(moto); setMostrarFormulario(true); }}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    highContrast ? 'bg-gray-100 text-black border border-gray-300' : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  ✏️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}