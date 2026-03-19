import { render, screen } from '@testing-library/react';
import ClienteDetallePage from '@/app/dashboard/clientes/[id]/page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'cli-1' }),
}));

jest.mock('@/components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/hooks/useClientes', () => ({
  useClientes: () => ({
    clientes: [{
      id: 'cli-1',
      nombre: 'Cliente Riesgo',
      tipoDocumento: 'CC',
      numeroDocumento: '123',
      telefono: '300',
      email: 'c@test.com',
      fechaNacimiento: '1990-01-01',
      licencia: { numero: 'LIC', categoria: 'A2', fechaVencimiento: '2030-01-01' },
      direccion: 'Test',
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: 50,
      incidentes: [
        { id: 'inc-1', tipo: 'multa', descripcion: 'Uno', fecha: '2026-01-01', monto: 180 },
        { id: 'inc-2', tipo: 'dano', descripcion: 'Dos', fecha: '2026-02-01', monto: 180 },
      ],
    }],
    actualizarCliente: jest.fn(),
  }),
}));

jest.mock('@/hooks/useReservas', () => ({
  useReservas: () => ({
    reservas: [
      {
        id: 'res-1', vehiculoId: 1, cliente: 'Cliente Riesgo', documento: '123', fechaInicio: '2026-03-01', fechaFin: '2026-03-02',
        desglose: { dias: 1, precioDia: 100, totalExtras: 0, deposito: 20 }, totalFinal: 100, estado: 'confirmada',
        pago: { metodoPago: 'efectivo', estado: 'procesado', fechaOperacion: '2026-03-01' },
      },
    ],
  }),
}));

jest.mock('@/hooks/useVehiculos', () => ({
  useVehiculos: () => ({
    vehiculos: [{ id: 1, marca: 'Yamaha', modelo: 'MT-03', anio: 2024, placa: 'A', kilometraje: 1, proximoMantenimiento: 1, estado: 'available', tipo: 'Naked', precioDia: 100, foto: 'x' }],
  }),
}));

describe('ClienteDetallePage (HU 3.2)', () => {
  // # Esta prueba es la 2 para la HU 3.2
  it('shows high-risk alert when incidents exceed threshold', () => {
    render(<ClienteDetallePage />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/riesgo alto/i)).toBeInTheDocument();
  });

  // # Esta prueba es la 3 para la HU 3.2
  it('renders statistics cards and top rented vehicles', () => {
    render(<ClienteDetallePage />);

    expect(screen.getByText(/ltv/i)).toBeInTheDocument();
    expect(screen.getByText(/vehículos más rentados/i)).toBeInTheDocument();
    expect(screen.getByText(/yamaha mt-03/i)).toBeInTheDocument();
  });
});
