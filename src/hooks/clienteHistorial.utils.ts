import { Cliente, ClienteIncidente } from '@/data/ClientesData';
import { Reserva } from '@/data/HU3_ReservasData';
import { Vehiculo } from '@/data/HU1_VehiculosData';

export interface ClienteHistorialStats {
  ltv: number;
  reservasActivas: number;
  reservasTotales: number;
  topVehiculos: Array<{ vehiculoId: number; nombre: string; cantidad: number }>;
  incidentes: ClienteIncidente[];
  totalMultas: number;
  riesgoAlto: boolean;
}

export const buildClienteHistorialStats = (
  cliente: Cliente,
  reservas: Reserva[],
  vehiculos: Vehiculo[],
): ClienteHistorialStats => {
  const reservasCliente = reservas.filter((reserva) => reserva.documento === cliente.numeroDocumento);
  const reservasValidas = reservasCliente.filter((reserva) => reserva.estado !== 'cancelada');

  const ltv = reservasValidas.reduce((acc, reserva) => acc + reserva.totalFinal, 0);
  const reservasActivas = reservasCliente.filter((reserva) => reserva.estado === 'confirmada').length;

  const counter = new Map<number, number>();
  reservasCliente.forEach((reserva) => {
    counter.set(reserva.vehiculoId, (counter.get(reserva.vehiculoId) ?? 0) + 1);
  });

  const topVehiculos = Array.from(counter.entries())
    .map(([vehiculoId, cantidad]) => {
      const vehiculo = vehiculos.find((item) => item.id === vehiculoId);
      return {
        vehiculoId,
        cantidad,
        nombre: vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : `Vehículo ${vehiculoId}`,
      };
    })
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 3);

  const incidentes = cliente.incidentes ?? [];
  const totalMultas = incidentes.reduce((acc, incidente) => acc + (incidente.monto ?? 0), 0);
  const riesgoAlto = incidentes.length >= 2 || totalMultas >= 300;

  return {
    ltv,
    reservasActivas,
    reservasTotales: reservasCliente.length,
    topVehiculos,
    incidentes,
    totalMultas,
    riesgoAlto,
  };
};
