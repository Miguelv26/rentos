import { useEffect, useState } from 'react';
import { Cliente, ClienteIncidente, ClientesMock } from '@/data/ClientesData';
import {
  ClienteInput,
  calculateClienteScore,
  normalizeCliente,
  validateClienteInput,
} from '@/hooks/clientes.utils';
import { api } from '@/lib/api';

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeBackendCliente = (cliente: Cliente): Cliente => normalizeCliente({
  ...cliente,
  reservasTotales: toNumber(cliente.reservasTotales),
  totalGastado: toNumber(cliente.totalGastado),
  cancelaciones: toNumber(cliente.cancelaciones),
  score: toNumber(cliente.score),
  incidentes: cliente.incidentes ?? [],
});

const toBackendPayload = (cliente: ClienteInput | Partial<Cliente>) => ({
  nombre: cliente.nombre,
  tipoDocumento: cliente.tipoDocumento,
  numeroDocumento: cliente.numeroDocumento,
  telefono: cliente.telefono,
  email: cliente.email,
  fechaNacimiento: cliente.fechaNacimiento,
  licencia: cliente.licencia,
  direccion: cliente.direccion,
  avatar: cliente.avatar,
});

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await api.get<Cliente[]>('/clientes');
      const normalizados = data.map(normalizeBackendCliente);

      if (normalizados.length === 0) {
        const creados: Cliente[] = [];
        for (const cliente of ClientesMock.slice(0, 5)) {
          const creado = await api.post<Cliente>('/clientes', toBackendPayload(cliente));
          creados.push(normalizeBackendCliente(creado));
        }
        setClientes(creados);
      } else {
        setClientes(normalizados);
      }

      setError(null);
    } catch (err) {
      console.error('Error cargando clientes desde backend:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
      setClientes(ClientesMock.map(normalizeCliente));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const crearCliente = async (cliente: ClienteInput) => {
    if (clientes.some((c) => c.numeroDocumento === cliente.numeroDocumento)) {
      throw new Error('Ya existe un cliente con este número de documento');
    }

    validateClienteInput(cliente);

    const temporal: Cliente = {
      ...cliente,
      id: `tmp-${Date.now()}`,
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: calculateClienteScore({
        reservasTotales: 0,
        cancelaciones: 0,
        incidentes: [],
        estado: 'activo',
      }),
      incidentes: [],
    };

    setClientes((prev) => [temporal, ...prev]);

    try {
      const creado = await api.post<Cliente>('/clientes', toBackendPayload(cliente));
      const normalizado = normalizeBackendCliente(creado);
      setClientes((prev) => [normalizado, ...prev.filter((c) => c.id !== temporal.id)]);
      return normalizado;
    } catch (err) {
      setClientes((prev) => prev.filter((c) => c.id !== temporal.id));
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
      throw err;
    }
  };

  const actualizarCliente = async (id: string, cambios: Partial<Cliente>) => {
    const anteriores = clientes;
    const nuevosClientes = clientes.map((cliente) => {
      if (cliente.id !== id) return cliente;
      const actualizado = normalizeCliente({ ...cliente, ...cambios });
      return {
        ...actualizado,
        score: calculateClienteScore({
          reservasTotales: actualizado.reservasTotales,
          cancelaciones: actualizado.cancelaciones,
          incidentes: actualizado.incidentes,
          estado: 'activo',
        }),
      };
    });

    setClientes(nuevosClientes);

    try {
      const actualizado = await api.patch<Cliente>(`/clientes/${id}`, toBackendPayload(cambios));
      setClientes((prev) => prev.map((cliente) => cliente.id === id ? normalizeBackendCliente(actualizado) : cliente));
    } catch (err) {
      setClientes(anteriores);
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente');
      throw err;
    }
  };

  const agregarIncidente = (clienteId: string, incidente: ClienteIncidente) => {
    const cliente = clientes.find((item) => item.id === clienteId);
    if (!cliente) throw new Error('Cliente no encontrado');

    const incidenteConPagado = incidente as ClienteIncidente & { pagado?: boolean };

    actualizarCliente(clienteId, {
      incidentes: [...(cliente.incidentes ?? []), { ...incidente, pagado: incidenteConPagado.pagado ?? false } as ClienteIncidente],
    });
  };

  const pagarIncidente = (clienteId: string, incidenteId: string) => {
    const cliente = clientes.find((item) => item.id === clienteId);
    if (!cliente) throw new Error('Cliente no encontrado');

    const incidentesActualizados = (cliente.incidentes ?? []).map((incidente) => {
      if (incidente.id !== incidenteId) return incidente;
      return { ...incidente, pagado: true, fechaPago: new Date().toISOString().split('T')[0] } as ClienteIncidente;
    });

    actualizarCliente(clienteId, { incidentes: incidentesActualizados });
  };

  const eliminarCliente = async (id: string) => {
    const anteriores = clientes;
    setClientes(clientes.filter((cliente) => cliente.id !== id));

    try {
      await api.delete<void>(`/clientes/${id}`);
    } catch (err) {
      setClientes(anteriores);
      setError(err instanceof Error ? err.message : 'Error al eliminar cliente');
      throw err;
    }
  };

  const buscarClientes = (query: string): Cliente[] => {
    const q = query.toLowerCase();
    return clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(q) ||
      cliente.numeroDocumento.includes(q) ||
      cliente.telefono.includes(q) ||
      cliente.email.toLowerCase().includes(q)
    );
  };

  const calcularScore = (
    reservasTotales: number,
    cancelaciones: number,
    incidentes: ClienteIncidente[] = []
  ): number => calculateClienteScore({
    reservasTotales,
    cancelaciones,
    incidentes,
    estado: 'activo',
  });

  return {
    clientes,
    loading,
    error,
    crearCliente,
    actualizarCliente,
    agregarIncidente,
    pagarIncidente,
    eliminarCliente,
    buscarClientes,
    calcularScore,
    recargarClientes: cargarClientes,
  };
};
