import { useState } from 'react';
import { Cliente, ClienteIncidente, ClientesMock } from '@/data/ClientesData';
import {
  ClienteInput,
  calculateClienteScore,
  normalizeCliente,
  validateClienteInput,
} from '@/hooks/clientes.utils';

const STORAGE_KEY = 'rentos_clientes';

const getInitialClientes = (): Cliente[] => {
  if (typeof window === 'undefined') {
    return ClientesMock.map(normalizeCliente);
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as Cliente[];
      return parsed.map(normalizeCliente);
    }

    const baseClientes = ClientesMock.map(normalizeCliente);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(baseClientes));
    return baseClientes;
  } catch {
    return ClientesMock.map(normalizeCliente);
  }
};

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>(getInitialClientes);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const saveToStorage = (nuevosClientes: Cliente[]) => {
    const normalizados = nuevosClientes.map(normalizeCliente);
    setClientes(normalizados);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizados));
    }
  };

  const crearCliente = (cliente: ClienteInput) => {
    if (clientes.some((c) => c.numeroDocumento === cliente.numeroDocumento)) {
      throw new Error('Ya existe un cliente con este número de documento');
    }

    validateClienteInput(cliente);

    const nuevoCliente: Cliente = {
      ...cliente,
      id: `cli-${Date.now()}`,
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: calculateClienteScore(0, 0, []),
      incidentes: [],
    };

    saveToStorage([...clientes, nuevoCliente]);
    return nuevoCliente;
  };

  const actualizarCliente = (id: string, cambios: Partial<Cliente>) => {
    const nuevosClientes = clientes.map((cliente) => {
      if (cliente.id !== id) {
        return cliente;
      }

      const actualizado = normalizeCliente({
        ...cliente,
        ...cambios,
      });

      return {
        ...actualizado,
        score: calculateClienteScore(
          actualizado.reservasTotales,
          actualizado.cancelaciones,
          actualizado.incidentes,
        ),
      };
    });

    saveToStorage(nuevosClientes);
  };

  const agregarIncidente = (clienteId: string, incidente: ClienteIncidente) => {
    const cliente = clientes.find((item) => item.id === clienteId);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    actualizarCliente(clienteId, {
      incidentes: [
        ...(cliente.incidentes ?? []),
        { ...incidente, pagado: incidente.pagado ?? false },
      ],
    });
  };

  const pagarIncidente = (clienteId: string, incidenteId: string) => {
    const cliente = clientes.find((item) => item.id === clienteId);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const incidentesActualizados = (cliente.incidentes ?? []).map((incidente) => {
      if (incidente.id !== incidenteId) {
        return incidente;
      }

      return {
        ...incidente,
        pagado: true,
        fechaPago: new Date().toISOString().split('T')[0],
      };
    });

    actualizarCliente(clienteId, {
      incidentes: incidentesActualizados,
    });
  };

  const eliminarCliente = (id: string) => {
    saveToStorage(clientes.filter((cliente) => cliente.id !== id));
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
  ): number => {
    return calculateClienteScore(reservasTotales, cancelaciones, incidentes);
  };

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
  };
};