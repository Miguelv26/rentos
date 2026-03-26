"use client";
import { useCallback, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useClientes } from '@/hooks/useClientes';
import { Cliente } from '@/data/ClientesData';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ClienteInput } from '@/hooks/clientes.utils';
import { useConfig } from '@/context/ConfigContext';

export default function ClientesPage() {
  const { clientes, crearCliente, actualizarCliente, buscarClientes } = useClientes();
  const { t, highContrast } = useConfig();

  const selectClass = highContrast
    ? 'w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm text-black'
    : 'w-full bg-[#1A1A24] border border-gray-700 rounded-lg p-2.5 text-sm text-white';

  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nombre: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    licencia: { numero: '', categoria: 'A2', fechaVencimiento: '' },
    direccion: '',
    avatar: ''
  });

  const clientesFiltrados = busqueda ? buscarClientes(busqueda) : clientes;

  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      telefono: '',
      email: '',
      fechaNacimiento: '',
      licencia: { numero: '', categoria: 'A2', fechaVencimiento: '' },
      direccion: '',
      avatar: ''
    });
    setClienteEditar(null);
  }, []);

  const cerrarModal = useCallback(() => {
    setMostrarModal(false);
    resetForm();
  }, [resetForm]);

  const abrirNuevoCliente = useCallback(() => {
    resetForm();
    setMostrarModal(true);
  }, [resetForm]);

  const abrirEdicion = useCallback((cliente: Cliente) => {
    setClienteEditar(cliente);
    setFormData(cliente);
    setMostrarModal(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (clienteEditar) {
        actualizarCliente(clienteEditar.id, formData);
        toast.success(t('clientesHu', 'successActualizado'));
      } else {
        const payload: ClienteInput = {
          nombre: formData.nombre ?? '',
          tipoDocumento: formData.tipoDocumento ?? 'CC',
          numeroDocumento: formData.numeroDocumento ?? '',
          telefono: formData.telefono ?? '',
          email: formData.email ?? '',
          fechaNacimiento: formData.fechaNacimiento ?? '',
          licencia: {
            numero: formData.licencia?.numero ?? '',
            categoria: formData.licencia?.categoria ?? 'A2',
            fechaVencimiento: formData.licencia?.fechaVencimiento ?? '',
          },
          direccion: formData.direccion ?? '',
          avatar: formData.avatar,
        };

        crearCliente(payload);
        toast.success(t('clientesHu', 'successCreado'));
      }

      cerrarModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('clientesHu', 'errorGuardar');
      toast.error(message);
    }
  };

  const getClasificacion = (cliente: Cliente) => {
    if (cliente.reservasTotales > 5) return { label: t('clientesHu', 'frecuente'), variant: 'success' as const };
    if (cliente.score < 40) return { label: t('clientesHu', 'riesgo'), variant: 'danger' as const };
    if (cliente.reservasTotales <= 2) return { label: t('clientesHu', 'nuevoLabel'), variant: 'info' as const };
    return { label: t('clientesHu', 'regular'), variant: 'default' as const };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic uppercase">👥 {t('clientesHu', 'title')}</h1>
            <p className="text-gray-500">{t('clientesHu', 'subtitle')}</p>
          </div>
          <Button onClick={abrirNuevoCliente}>
            {t('clientesHu', 'nuevo')}
          </Button>
        </div>

        <div className="flex gap-4">
          <Input
            id="clientes-busqueda"
            aria-label="Buscar clientes"
            placeholder={t('clientesHu', 'buscarPlaceholder')}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl overflow-hidden">
          <Table caption={t('clientesHu', 'tablaCaption')}>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>{t('clientesHu', 'cliente')}</TableHead>
                <TableHead>{t('clientesHu', 'documento')}</TableHead>
                <TableHead>{t('clientesHu', 'contacto')}</TableHead>
                <TableHead>{t('clientesHu', 'reservas')}</TableHead>
                <TableHead>{t('clientesHu', 'score')}</TableHead>
                <TableHead>{t('clientesHu', 'clasificacion')}</TableHead>
                <TableHead>{t('clientesHu', 'acciones')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => {
                const clasificacion = getClasificacion(cliente);

                return (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={cliente.avatar || 'https://via.placeholder.com/40'}
                          alt={cliente.nombre}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold">{cliente.nombre}</p>
                          <p className="text-xs text-gray-500">{cliente.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-gray-400">{cliente.tipoDocumento}</p>
                      <p className="font-mono text-sm">{cliente.numeroDocumento}</p>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm">{cliente.telefono}</p>
                    </TableCell>

                    <TableCell>
                      <p className="text-lg font-black text-[#00E5FF]">{cliente.reservasTotales}</p>
                      <p className="text-xs text-gray-500">${cliente.totalGastado.toLocaleString()}</p>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cliente.score >= 70 ? 'bg-green-500' : cliente.score >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                            style={{ width: `${cliente.score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold">{cliente.score}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={clasificacion.variant}>{clasificacion.label}</Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/clientes/${cliente.id}`}>
                          <Button size="sm" variant="ghost" aria-label={`${t('clientesHu', 'ver')} ${cliente.nombre}`}>
                            {t('clientesHu', 'ver')}
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => abrirEdicion(cliente)}
                          aria-label={`${t('clientesHu', 'editar')} ${cliente.nombre}`}
                        >
                          {t('clientesHu', 'editar')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Modal
          isOpen={mostrarModal}
          onClose={cerrarModal}
          title={clienteEditar ? `✏️ ${t('clientesHu', 'modalEditar')}` : `➕ ${t('clientesHu', 'modalNuevo')}`}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('clientesHu', 'nombreCompleto')}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
              <Input
                label={t('clientesHu', 'email')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                  {t('clientesHu', 'tipoDocumento')}
                </label>
                <select
                  className={selectClass}
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as Cliente['tipoDocumento'] })}
                >
                  <option value="CC">CC</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="CE">CE</option>
                </select>
              </div>

              <Input
                label={t('clientesHu', 'numeroDocumento')}
                value={formData.numeroDocumento}
                onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                required
                className="col-span-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('clientesHu', 'telefono')}
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
              <Input
                label={t('clientesHu', 'fechaNacimiento')}
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                required
              />
            </div>

            <Input
              label={t('clientesHu', 'direccion')}
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label={t('clientesHu', 'licenciaNumero')}
                value={formData.licencia?.numero}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    licencia: { ...formData.licencia!, numero: e.target.value }
                  })
                }
                required
              />

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                  {t('clientesHu', 'categoria')}
                </label>
                <select
                  className={selectClass}
                  value={formData.licencia?.categoria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licencia: { ...formData.licencia!, categoria: e.target.value }
                    })
                  }
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                </select>
              </div>

              <Input
                label={t('clientesHu', 'vencimiento')}
                type="date"
                value={formData.licencia?.fechaVencimiento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    licencia: { ...formData.licencia!, fechaVencimiento: e.target.value }
                  })
                }
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={cerrarModal}
                className="flex-1"
              >
                {t('clientesHu', 'cancelar')}
              </Button>

              <Button type="submit" className="flex-1">
                {clienteEditar ? t('clientesHu', 'actualizar') : t('clientesHu', 'crear')} {t('clientesHu', 'cliente')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}