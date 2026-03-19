import { useState, useEffect } from 'react';
import { Cliente, ClientesMock } from '@/data/ClientesData';
import { ClienteInput, normalizeCliente, validateClienteInput } from '@/hooks/clientes.utils';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rentos_clientes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Cliente[];
        setClientes(parsed.map(normalizeCliente));
      } catch (e) {
        setError('Error al cargar clientes');
      }
    } else {
      setClientes(ClientesMock.map(normalizeCliente));
      localStorage.setItem('rentos_clientes', JSON.stringify(ClientesMock));
    }
    setLoading(false);
  }, []);

  const saveToStorage = (nuevosClientes: Cliente[]) => {
    setClientes(nuevosClientes);
    localStorage.setItem('rentos_clientes', JSON.stringify(nuevosClientes));
  };

  const crearCliente = (cliente: ClienteInput) => {
    // Validar documento duplicado
    if (clientes.some(c => c.numeroDocumento === cliente.numeroDocumento)) {
      throw new Error('Ya existe un cliente con este número de documento');
    }

    validateClienteInput(cliente);

    const nuevoCliente: Cliente = {
      ...cliente,
      id: `cli-${Date.now()}`,
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: 100,
      incidentes: [],
    };
    saveToStorage([...clientes, nuevoCliente]);
    return nuevoCliente;
  };

  const actualizarCliente = (id: string, cambios: Partial<Cliente>) => {
    const nuevosClientes = clientes.map(c => c.id === id ? { ...c, ...cambios } : c);
    saveToStorage(nuevosClientes);
  };

  const eliminarCliente = (id: string) => {
    saveToStorage(clientes.filter(c => c.id !== id));
  };

  const buscarClientes = (query: string): Cliente[] => {
    const q = query.toLowerCase();
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.numeroDocumento.includes(q) ||
      c.telefono.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  };

  const calcularScore = (reservasTotales: number, cancelaciones: number): number => {
    const score = 100 - (cancelaciones * 10) + (Math.min(reservasTotales, 10) * 5);
    return Math.max(0, Math.min(100, score));
  };

  return {
    clientes,
    loading,
    error,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    calcularScore
  };
};
