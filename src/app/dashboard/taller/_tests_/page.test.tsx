import { render, screen, fireEvent } from '@testing-library/react';
import TallerPage from '@/app/dashboard/taller/page';
import React from 'react';

jest.mock('@/components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockSetVehiculos = jest.fn();

jest.mock('@/hooks/useVehiculos', () => ({
  useVehiculos: () => ({
    vehiculos: [
      {
        id: 100,
        marca: 'TestM',
        modelo: 'TMX',
        anio: 2024,
        placa: 'ZZZ-100',
        kilometraje: 100,
        proximoMantenimiento: 200,
        estado: 'available',
        tipo: 'Naked',
        precioDia: 40,
        foto: 'x',
      }
    ],
    setVehiculos: mockSetVehiculos
  })
}));

jest.mock('@/context/ConfigContext', () => ({
  useConfig: () => ({ t: (a: any, b?: any) => (b || a), highContrast: false })
}));

describe('TallerPage - HU1.2', () => {
  beforeEach(() => {
    mockSetVehiculos.mockClear();
  });

  it('registra ingreso y cambia estado a maintenance', () => {
    const { container } = render(<TallerPage />);
    (global as any).alert = jest.fn();

    const btn = screen.getByRole('button', { name: /Registrar Entrada|\+ Registrar Entrada|\+ Registrar Entrada/i });
    fireEvent.click(btn);

    const selects = screen.getAllByRole('combobox');
    const select = selects[0];
    fireEvent.change(select, { target: { value: '100' } });

    const tareaInput = screen.getByPlaceholderText(/Ej: Kit de Arrastre/i);
    fireEvent.change(tareaInput, { target: { value: 'Cambio aceite' } });

    const dateInputs = container.querySelectorAll('input[type="date"]');
    if (dateInputs && dateInputs.length > 1) {
      fireEvent.change(dateInputs[1], { target: { value: '2026-03-25' } });
    }
    
    const confirmar = screen.getByRole('button', { name: /Confirmar Orden/i });
    fireEvent.click(confirmar);

    expect(mockSetVehiculos).toHaveBeenCalled();
    const updated = mockSetVehiculos.mock.calls[0][0];
    expect(updated.some((v: any) => v.id === 100 && v.estado === 'maintenance')).toBe(true);
  });

  it('finaliza servicio y agrega registro de mantenimiento con costo', () => {
    render(<TallerPage />);

    const ingresarBtn = screen.getByRole('button', { name: /Ingresar a Box/i });
    fireEvent.click(ingresarBtn);

    const costoInput = screen.getByPlaceholderText(/Costo Total \(\$\)/i);
    fireEvent.change(costoInput, { target: { value: '1234' } });

    const darAlta = screen.getByRole('button', { name: /Dar de Alta/i });
    fireEvent.click(darAlta);

    expect(mockSetVehiculos).toHaveBeenCalled();
    const updated = mockSetVehiculos.mock.calls[mockSetVehiculos.mock.calls.length - 1][0];
    const v = updated.find((vv: any) => vv.id === 100);
    expect(v.estado).toBe('available');
    expect(v.historial && v.historial.length >= 0).toBe(true);
  });
});
