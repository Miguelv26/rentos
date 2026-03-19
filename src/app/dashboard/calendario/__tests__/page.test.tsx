import { fireEvent, render, screen } from '@testing-library/react';
import CalendarioPage from '@/app/dashboard/calendario/page';

jest.mock('@/components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/hooks/useVehiculos', () => ({
  useVehiculos: () => ({
    vehiculos: [
      {
        id: 1,
        marca: 'Yamaha',
        modelo: 'MT-03',
        anio: 2024,
        placa: 'AAA111',
        kilometraje: 1000,
        proximoMantenimiento: 500,
        estado: 'available',
        tipo: 'Naked',
        precioDia: 50,
        foto: 'x',
      },
    ],
  }),
}));

jest.mock('@/hooks/useReservas', () => ({
  useReservas: () => ({
    reservas: [
      {
        id: 'res-1',
        vehiculoId: 1,
        cliente: 'Juan',
        documento: '123',
        fechaInicio: '2026-03-18',
        fechaFin: '2026-03-19',
        desglose: { dias: 2, precioDia: 50, totalExtras: 0, deposito: 20 },
        totalFinal: 100,
        estado: 'confirmada',
        pago: { metodoPago: 'efectivo', estado: 'procesado', fechaOperacion: '2026-03-18' },
      },
    ],
  }),
}));

describe('CalendarioPage (HU 2.2)', () => {
  // # Esta prueba es la 2 para la HU 2.2
  it('opens detail modal when clicking occupied cell', () => {
    render(<CalendarioPage />);

    const occupiedButton = screen.getAllByRole('button', { name: /reserva\(s\)/i })[0];
    fireEvent.click(occupiedButton);

    expect(screen.getByRole('dialog', { name: /detalle de ocupación/i })).toBeInTheDocument();
  });

  // # Esta prueba es la 3 para la HU 2.2
  it('renders quick access link to create reservations', () => {
    render(<CalendarioPage />);

    const quickLink = screen.getByRole('link', { name: /nueva reserva/i });
    expect(quickLink).toBeInTheDocument();
    expect(quickLink).toHaveAttribute('href', '/dashboard/reservas');
  });
});
