"use client";
import { useState, useEffect } from "react";
import { Vehiculo } from "@/data/HU1_VehiculosData";
import { useConfig } from "@/context/ConfigContext";

interface Props {
  vehiculo?: Vehiculo | null;
  onSave: (v: Vehiculo) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export const HU1_VehiculoForm = ({ vehiculo, onSave, onCancel, onDelete }: Props) => {
  const { highContrast } = useConfig();
  
  const [formData, setFormData] = useState<Vehiculo>({
    id: 0,
    marca: "",
    modelo: "",
    anio: 2024,
    placa: "",
    kilometraje: 0,
    proximoMantenimiento: 0,
    estado: "available",
    tipo: "Naked",
    precioDia: 0,
    foto: ""
  });

  useEffect(() => {
    if (vehiculo) setFormData(vehiculo);
  }, [vehiculo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['anio', 'kilometraje', 'proximoMantenimiento', 'precioDia'].includes(name);
    setFormData({ 
      ...formData, 
      [name]: isNumber ? Number(value) : value 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = `w-full bg-black/20 border border-gray-700 rounded-lg p-2.5 text-sm focus:border-[#00E5FF] outline-none transition ${highContrast ? 'bg-white border-gray-400 text-black' : 'text-white'}`;
  const labelClass = "block text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className={`${highContrast ? 'bg-white' : 'bg-[#1E1E1E]'} p-8 rounded-2xl w-full max-w-2xl shadow-2xl border ${highContrast ? 'border-gray-300' : 'border-gray-800'} my-auto`}>
        <h2 className={`text-2xl font-black mb-6 uppercase italic ${highContrast ? 'text-black' : 'text-white'}`}>
          {vehiculo ? '⚙️ Editar Ficha Técnica' : '🚀 Registrar Nueva Moto'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Marca</label>
            <input name="marca" value={formData.marca} onChange={handleChange} className={inputClass} placeholder="Ej: Yamaha" required />
          </div>
          <div>
            <label className={labelClass}>Modelo</label>
            <input name="modelo" value={formData.modelo} onChange={handleChange} className={inputClass} placeholder="Ej: MT-03" required />
          </div>

          <div>
            <label className={labelClass}>Año</label>
            <input type="number" name="anio" value={formData.anio} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Placa / Matrícula</label>
            <input name="placa" value={formData.placa} onChange={handleChange} className={inputClass} placeholder="KTC-112" required />
          </div>

          <div>
            <label className={labelClass}>Kilometraje Total</label>
            <input type="number" name="kilometraje" value={formData.kilometraje} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Km para Mantenimiento</label>
            <input type="number" name="proximoMantenimiento" value={formData.proximoMantenimiento} onChange={handleChange} className={inputClass} required />
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <select name="estado" value={formData.estado} onChange={handleChange} className={inputClass}>
              <option value="available">Disponible</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="rented">Alquilado</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Categoría (Tipo)</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className={inputClass}>
              <option value="Sport">Sport</option>
              <option value="Adventure">Adventure</option>
              <option value="Naked">Naked</option>
              <option value="Cruiser">Cruiser</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Precio por Día ($)</label>
            <input type="number" name="precioDia" value={formData.precioDia} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>URL de la Fotografía</label>
            <input name="foto" value={formData.foto} onChange={handleChange} className={inputClass} placeholder="https://..." required />
          </div>

          <div className="md:col-span-2 pt-6 space-y-3">
            <button type="submit" className="w-full bg-[#00E5FF] text-black py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              {vehiculo ? 'Actualizar Ficha' : 'Dar de Alta Vehículo'}
            </button>
            
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className={`flex-1 py-3 rounded-xl font-bold text-xs transition ${highContrast ? 'bg-gray-200 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                Cancelar
              </button>
              {vehiculo && (
                <button 
                  type="button" 
                  onClick={() => onDelete?.(vehiculo.id)} 
                  className="flex-1 bg-red-600/10 text-red-500 border border-red-600/50 py-3 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition"
                >
                  Eliminar de Flota
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};