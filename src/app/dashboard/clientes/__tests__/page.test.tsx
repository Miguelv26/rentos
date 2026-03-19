import { fireEvent, render, screen } from '@testing-library/react';
import ClientesPage from '@/app/dashboard/clientes/page';

jest.mock('@/components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/hooks/useClientes', () => ({
  useClientes: () => ({
    clientes: [],
    crearCliente: jest.fn(),
    actualizarCliente: jest.fn(),
    eliminarCliente: jest.fn(),
    buscarClientes: jest.fn(() => []),
  }),
}));

describe('ClientesPage (HU 3.1)', () => {
  // # Esta prueba es la 1 para la HU 3.1
  it('renders customer form fields in modal', () => {
    render(<ClientesPage />);

    fireEvent.click(screen.getByRole('button', { name: /nuevo cliente/i }));

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número documento/i)).toBeInTheDocument();
  });
});
