"use client";
import { useConfig } from '@/context/ConfigContext';
import { Vehiculo } from '@/data/HU1_VehiculosData';

interface Props {
  vehiculo: Vehiculo;
  onEdit: (v: Vehiculo) => void; 
}

export const HU1_VehiculoCard = ({ vehiculo, onEdit }: Props) => {
  const { t, highContrast } = useConfig();

  const cardStyle = highContrast
    ? 'bg-white border-2 border-gray-200 text-black shadow-md'
    : 'bg-[#1E1E1E] border border-gray-800 text-white shadow-lg hover:border-[#00E5FF]';

  const textSecondary = highContrast ? 'text-gray-600' : 'text-gray-400';

  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-300 group ${cardStyle}`}>
      <div className="h-44 overflow-hidden relative">
        <img src={vehiculo.foto} alt={vehiculo.modelo} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-[10px] font-bold">
          {vehiculo.placa}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{vehiculo.modelo}</h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            vehiculo.estado === 'available' ? 'bg-green-500/20 text-green-500' :
            vehiculo.estado === 'maintenance' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
          }`}>
            {t('status', vehiculo.estado)}
          </span>
        </div>

        <div className={`text-xs mb-4 space-y-1 ${textSecondary}`}>
          <p>📍 {t('card', 'km')}: {vehiculo.kilometraje}</p>
          <p>🔧 {t('card', 'maint')}: 500km</p>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold py-1.5 rounded text-xs transition">
            {t('card', 'btn_details')}
          </button>
          
          <button 
            onClick={() => onEdit(vehiculo)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition"
          >
            ✏️
          </button>
        </div>
      </div>
    </div>
  );
};