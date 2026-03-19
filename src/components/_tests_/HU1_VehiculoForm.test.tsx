import { render, screen, fireEvent } from '@testing-library/react';
import { HU1_VehiculoForm } from '@/components/HU1_VehiculoForm';
import React from 'react';

describe('HU1_VehiculoForm', () => {
  it('tiene atributos required en campos críticos', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { container } = render(<HU1_VehiculoForm onSave={onSave} onCancel={onCancel} />);

    expect(container.querySelector('input[name="marca"]')).toHaveAttribute('required');
    expect(container.querySelector('input[name="modelo"]')).toHaveAttribute('required');
    expect(container.querySelector('input[name="placa"]')).toHaveAttribute('required');
    expect(container.querySelector('input[name="precioDia"]')).toHaveAttribute('required');
    expect(container.querySelector('input[name="foto"]')).toHaveAttribute('required');
  });

  it('envía los datos correctos incluyendo la URL de la foto', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const { container } = render(<HU1_VehiculoForm onSave={onSave} onCancel={onCancel} />);

    fireEvent.change(container.querySelector('input[name="marca"]')!, { target: { value: 'TestMarca' } });
    fireEvent.change(container.querySelector('input[name="modelo"]')!, { target: { value: 'ModelX' } });
    fireEvent.change(container.querySelector('input[name="anio"]')!, { target: { value: '2024' } });
    fireEvent.change(container.querySelector('input[name="placa"]')!, { target: { value: 'AAA-111' } });
    fireEvent.change(container.querySelector('input[name="kilometraje"]')!, { target: { value: '100' } });
    fireEvent.change(container.querySelector('input[name="proximoMantenimiento"]')!, { target: { value: '500' } });
    fireEvent.change(container.querySelector('input[name="precioDia"]')!, { target: { value: '70' } });
    fireEvent.change(container.querySelector('input[name="foto"]')!, { target: { value: 'https://example.com/photo.jpg' } });

    const submit = screen.getByRole('button', { name: /Dar de Alta Vehículo/i });
    fireEvent.click(submit);

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.marca).toBe('TestMarca');
    expect(payload.foto).toBe('https://example.com/photo.jpg');
  });

  it('actualiza el estado operativo cuando se edita y envía el formulario', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();

    const vehiculo = {
      id: 10,
      placa: 'EDIT-10',
      modelo: 'EditModel',
      marca: 'EditBrand',
      anio: 2022,
      estado: 'available' as const,
      tipo: 'Naked' as const,
      foto: '/x.jpg',
      precioDia: 30,
      kilometraje: 0,
      proximoMantenimiento: 0
    };

    const { container } = render(<HU1_VehiculoForm vehiculo={vehiculo as any} onSave={onSave} onCancel={onCancel} />);

    const estadoSelect = container.querySelector('select[name="estado"]') as HTMLSelectElement;
    expect(estadoSelect.value).toBe('available');
    fireEvent.change(estadoSelect, { target: { value: 'maintenance' } });

    const submit = screen.getByRole('button', { name: /Actualizar Ficha/i });
    fireEvent.click(submit);

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.estado).toBe('maintenance');
  });
});
