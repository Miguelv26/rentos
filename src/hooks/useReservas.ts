import { useState, useEffect } from 'react';
import { PagoReserva, Reserva } from '@/data/HU3_ReservasData';
import { DEFAULT_DEPOSIT_RATE, hasReservationOverlap } from '@/hooks/reservas.utils';
import { api } from '@/lib/api';

type BackendReserva = Omit<Reserva, 'cliente'> & {
  clienteId?: string;
  cliente?: string | {
    id: string;
    nombre: string;
    numeroDocumento: string;
  };
};

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeReserva = (reserva: BackendReserva): Reserva => ({
  ...reserva,
  vehiculoId: Number(reserva.vehiculoId),
  clienteId: reserva.clienteId ?? (typeof reserva.cliente === 'object' ? reserva.cliente.id : undefined),
  cliente: typeof reserva.cliente === 'object' ? reserva.cliente.nombre : reserva.cliente ?? 'Cliente no encontrado',
  documento: typeof reserva.cliente === 'object' ? reserva.cliente.numeroDocumento : reserva.documento ?? '',
  desglose: {
    dias: toNumber(reserva.desglose?.dias),
    precioDia: toNumber(reserva.desglose?.precioDia),
    totalExtras: toNumber(reserva.desglose?.totalExtras),
    deposito: toNumber(reserva.desglose?.deposito ?? Math.round(toNumber(reserva.totalFinal) * DEFAULT_DEPOSIT_RATE)),
  },
  totalFinal: toNumber(reserva.totalFinal),
  pago: reserva.pago ?? {
    metodoPago: 'efectivo',
    estado: 'procesado',
    fechaOperacion: reserva.fechaInicio,
    referencia: `TXN-${reserva.id}`,
  },
});

const toBackendPayload = (
  reserva: Omit<Reserva, 'id' | 'pago'> & { pago?: PagoReserva; clienteId?: string }
) => {
  const clienteId = reserva.clienteId;

  if (!clienteId) {
    throw new Error('Debes seleccionar un cliente válido para crear la reserva');
  }

  return {
    clienteId: String(clienteId),
    vehiculoId: Number(reserva.vehiculoId),
    fechaInicio: reserva.fechaInicio,
    fechaFin: reserva.fechaFin,
    desglose: {
      dias: Number(reserva.desglose.dias),
      precioDia: Number(reserva.desglose.precioDia),
      totalExtras: Number(reserva.desglose.totalExtras),
      deposito: Number(reserva.desglose.deposito ?? 0),
    },
    totalFinal: Number(reserva.totalFinal),
    pago: reserva.pago,
  };
};

export const useReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const data = await api.get<BackendReserva[]>('/reservas');
      setReservas(data.map(normalizeReserva));
      setError(null);
    } catch (err) {
      console.error('Error cargando reservas desde backend:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar reservas');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const crearReserva = async (reserva: Omit<Reserva, 'id' | 'pago'> & { pago?: PagoReserva; clienteId?: string }) => {
    const temporal: Reserva = {
      ...reserva,
      id: `tmp-${Date.now()}`,
      pago: reserva.pago ?? {
        metodoPago: 'efectivo',
        estado: 'procesado',
        fechaOperacion: reserva.fechaInicio,
        referencia: `TXN-${Date.now()}`,
      },
    };

    setReservas((prev) => [temporal, ...prev]);

    try {
      const creada = await api.post<BackendReserva>('/reservas', toBackendPayload(temporal));
      const normalizada = normalizeReserva(creada);
      setReservas((prev) => [normalizada, ...prev.filter((r) => r.id !== temporal.id)]);
      return normalizada;
    } catch (err) {
      setReservas((prev) => prev.filter((r) => r.id !== temporal.id));
      setError(err instanceof Error ? err.message : 'Error al crear reserva');
      throw err;
    }
  };

  const actualizarReserva = async (id: string, cambios: Partial<Reserva>) => {
    const anteriores = reservas;
    setReservas(reservas.map((r) => (r.id === id ? { ...r, ...cambios } : r)));

    try {
      const actualizada = await api.patch<BackendReserva>(`/reservas/${id}`, cambios);
      setReservas((prev) => prev.map((r) => r.id === id ? normalizeReserva(actualizada) : r));
    } catch (err) {
      setReservas(anteriores);
      setError(err instanceof Error ? err.message : 'Error al actualizar reserva');
      throw err;
    }
  };

  const cancelarReserva = async (id: string) => {
    const actualizada = await api.patch<BackendReserva>(`/reservas/${id}/cancelar`);
    setReservas((prev) => prev.map((r) => r.id === id ? normalizeReserva(actualizada) : r));
  };

  const completarReserva = async (id: string) => {
    const actualizada = await api.patch<BackendReserva>(`/reservas/${id}/finalizar`);
    setReservas((prev) => prev.map((r) => r.id === id ? normalizeReserva(actualizada) : r));
  };

  const verificarDisponibilidad = (
    vehiculoId: number,
    fechaInicio: string,
    fechaFin: string,
    excluirReservaId?: string,
  ): boolean => {
    return !hasReservationOverlap(reservas, vehiculoId, fechaInicio, fechaFin, excluirReservaId);
  };

  const verificarDisponibilidadBackend = async (
    vehiculoId: number,
    fechaInicio: string,
    fechaFin: string,
    excluirReservaId?: string,
  ): Promise<boolean> => {
    const data = await api.post<{ disponible: boolean }>('/reservas/verificar-disponibilidad', {
      vehiculoId,
      fechaInicio,
      fechaFin,
      excluirReservaId,
    });

    return data.disponible;
  };

  return {
    reservas,
    loading,
    error,
    crearReserva,
    actualizarReserva,
    cancelarReserva,
    completarReserva,
    verificarDisponibilidad,
    verificarDisponibilidadBackend,
    recargarReservas: cargarReservas,
  };
};
