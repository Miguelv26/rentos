import { buildClienteHistorialStats } from '@/hooks/clienteHistorial.utils';
import { Cliente } from '@/data/ClientesData';
import { Reserva } from '@/data/HU3_ReservasData';
import { Vehiculo } from '@/data/HU1_VehiculosData';

describe('clienteHistorial.utils (HU 3.2)', () => {
  // # Esta prueba es la 1 para la HU 3.2
  it('calculates historical LTV from reservations', () => {
    const cliente: Cliente = {
      id: 'cli-1',
      nombre: 'Juan',
      tipoDocumento: 'CC',
      numeroDocumento: '123',
      telefono: '300',
      email: 'juan@test.com',
      fechaNacimiento: '1990-01-01',
      licencia: { numero: 'LIC', categoria: 'A2', fechaVencimiento: '2030-01-01' },
      direccion: 'Test',
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: 80,
      incidentes: [{ id: 'inc-1', tipo: 'multa', descripcion: 'Test', fecha: '2026-01-01', monto: 200 }],
    };

    const reservas: Reserva[] = [
      {
        id: 'res-1', vehiculoId: 1, cliente: 'Juan', documento: '123', fechaInicio: '2026-03-01', fechaFin: '2026-03-02',
        desglose: { dias: 1, precioDia: 100, totalExtras: 0, deposito: 20 }, totalFinal: 100, estado: 'confirmada',
        pago: { metodoPago: 'efectivo', estado: 'procesado', fechaOperacion: '2026-03-01' },
      },
      {
        id: 'res-2', vehiculoId: 2, cliente: 'Juan', documento: '123', fechaInicio: '2026-03-05', fechaFin: '2026-03-06',
        desglose: { dias: 1, precioDia: 200, totalExtras: 0, deposito: 40 }, totalFinal: 200, estado: 'finalizada',
        pago: { metodoPago: 'tarjeta_credito', estado: 'procesado', fechaOperacion: '2026-03-05' },
      },
    ];

    const vehiculos: Vehiculo[] = [
      { id: 1, marca: 'Yamaha', modelo: 'MT-03', anio: 2024, placa: 'A', kilometraje: 1, proximoMantenimiento: 1, estado: 'available', tipo: 'Naked', precioDia: 100, foto: 'x' },
      { id: 2, marca: 'Honda', modelo: 'CB', anio: 2024, placa: 'B', kilometraje: 1, proximoMantenimiento: 1, estado: 'available', tipo: 'Sport', precioDia: 200, foto: 'x' },
    ];

    const stats = buildClienteHistorialStats(cliente, reservas, vehiculos);

    expect(stats.ltv).toBe(300);
    expect(stats.reservasTotales).toBe(2);
    expect(stats.topVehiculos.length).toBeGreaterThan(0);
  });

  it('flags high risk when incidents are repeated or expensive', () => {
    const cliente: Cliente = {
      id: 'cli-2',
      nombre: 'Riesgo',
      tipoDocumento: 'CC',
      numeroDocumento: '999',
      telefono: '300',
      email: 'riesgo@test.com',
      fechaNacimiento: '1991-01-01',
      licencia: { numero: 'LIC-2', categoria: 'A2', fechaVencimiento: '2030-01-01' },
      direccion: 'Test',
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: 40,
      incidentes: [
        { id: 'inc-1', tipo: 'multa', descripcion: 'A', fecha: '2026-01-01', monto: 200 },
        { id: 'inc-2', tipo: 'dano', descripcion: 'B', fecha: '2026-01-02', monto: 150 },
      ],
    };

    const stats = buildClienteHistorialStats(cliente, [], []);

    expect(stats.riesgoAlto).toBe(true);
    expect(stats.totalMultas).toBe(350);
  });
});
