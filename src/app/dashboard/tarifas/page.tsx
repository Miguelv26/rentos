"use client";
import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useTarifas } from '@/hooks/useTarifas';
import { ReglaTarifa } from '@/data/TarifasData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function TarifasPage() {
  const { tarifas, crearTarifa, actualizarTarifa, eliminarTarifa, calcularPrecioFinal } = useTarifas();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [formData, setFormData] = useState<Partial<ReglaTarifa>>({
    nombre: '',
    tipo: 'temporada_alta',
    porcentaje: 0,
    vehiculosAplicables: 'todos',
    activa: true
  });
  
  const [calculadora, setCalculadora] = useState({
    precioBase: 50,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crearTarifa(formData as any);
    toast.success('Tarifa creada exitosamente');
    setMostrarModal(false);
    setFormData({ nombre: '', tipo: 'temporada_alta', porcentaje: 0, vehiculosAplicables: 'todos', activa: true });
  };

  const precioCalculado = calcularPrecioFinal(calculadora.precioBase, calculadora.fechaInicio, calculadora.fechaFin);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic uppercase">💰 Configurador de Tarifas</h1>
            <p className="text-gray-500">Reglas de precios dinámicos</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setMostrarCalculadora(true)}>
              🧮 Calculadora
            </Button>
            <Button onClick={() => setMostrarModal(true)}>
              + Nueva Regla
            </Button>
          </div>
        </div>

        {/* Lista de Tarifas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tarifas.map((tarifa) => (
            <Card key={tarifa.id} hover>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-black text-lg">{tarifa.nombre}</h3>
                <Badge variant={tarifa.activa ? 'success' : 'default'}>
                  {tarifa.activa ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-bold capitalize">{tarifa.tipo.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ajuste:</span>
                  <span className={`font-black text-lg ${tarifa.porcentaje > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tarifa.porcentaje > 0 ? '+' : ''}{tarifa.porcentaje}%
                  </span>
                </div>
                {tarifa.fechaInicio && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Periodo:</span>
                    <span className="text-xs">{tarifa.fechaInicio} → {tarifa.fechaFin}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => actualizarTarifa(tarifa.id, { activa: !tarifa.activa })}
                >
                  {tarifa.activa ? 'Desactivar' : 'Activar'}
                </Button>
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => {
                    if (confirm('¿Eliminar esta tarifa?')) {
                      eliminarTarifa(tarifa.id);
                      toast.success('Tarifa eliminada');
                    }
                  }}
                >
                  🗑️
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal Nueva Tarifa */}
        <Modal isOpen={mostrarModal} onClose={() => setMostrarModal(false)} title="➕ Nueva Regla de Tarifa">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de la Regla"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tipo</label>
                <select
                  className="w-full bg-[#1A1A24] border border-gray-700 rounded-lg p-2.5 text-sm text-white"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                >
                  <option value="temporada_alta">Temporada Alta</option>
                  <option value="fin_semana">Fin de Semana</option>
                  <option value="descuento_largo">Descuento Larga Duración</option>
                </select>
              </div>
              <Input
                label="Porcentaje (%)"
                type="number"
                value={formData.porcentaje}
                onChange={(e) => setFormData({ ...formData, porcentaje: Number(e.target.value) })}
                required
              />
            </div>

            {formData.tipo === 'temporada_alta' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha Inicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                />
                <Input
                  label="Fecha Fin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setMostrarModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">Crear Regla</Button>
            </div>
          </form>
        </Modal>

        {/* Modal Calculadora */}
        <Modal isOpen={mostrarCalculadora} onClose={() => setMostrarCalculadora(false)} title="🧮 Calculadora de Precio">
          <div className="space-y-4">
            <Input
              label="Precio Base por Día ($)"
              type="number"
              value={calculadora.precioBase}
              onChange={(e) => setCalculadora({ ...calculadora, precioBase: Number(e.target.value) })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha Inicio"
                type="date"
                value={calculadora.fechaInicio}
                onChange={(e) => setCalculadora({ ...calculadora, fechaInicio: e.target.value })}
              />
              <Input
                label="Fecha Fin"
                type="date"
                value={calculadora.fechaFin}
                onChange={(e) => setCalculadora({ ...calculadora, fechaFin: e.target.value })}
              />
            </div>

            <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl p-6 text-center">
              <p className="text-xs text-gray-400 uppercase mb-2">Precio Final Calculado</p>
              <p className="text-4xl font-black text-[#00E5FF]">${precioCalculado}</p>
              <p className="text-xs text-gray-500 mt-2">Con todas las reglas aplicadas</p>
            </div>

            <Button onClick={() => setMostrarCalculadora(false)} className="w-full">Cerrar</Button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
