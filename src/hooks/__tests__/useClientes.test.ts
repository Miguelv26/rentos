import { renderHook, act, waitFor } from '@testing-library/react';
import { useClientes } from '@/hooks/useClientes';

describe('useClientes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a new client with unique ID', async () => {
    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let newClient: any;
    act(() => {
      newClient = result.current.crearCliente({
        nombre: 'Juan Pérez',
        tipoDocumento: 'CC',
        numeroDocumento: '123456789',
        telefono: '3001234567',
        email: 'juan@test.com',
        fechaNacimiento: '1990-01-01',
        licencia: {
          numero: 'LIC123',
          categoria: 'A2',
          fechaVencimiento: '2030-01-01'
        },
        direccion: 'Calle 123'
      });
    });

    expect(newClient).toBeDefined();
    expect(newClient?.id).toContain('cli-');
    expect(newClient?.score).toBe(100);
    expect(newClient?.reservasTotales).toBe(0);
  });

  it('prevents duplicate document numbers', async () => {
    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearCliente({
        nombre: 'Cliente Uno',
        tipoDocumento: 'CC',
        numeroDocumento: '111111111',
        telefono: '3001111111',
        email: 'uno@test.com',
        fechaNacimiento: '1990-01-01',
        licencia: {
          numero: 'LIC1',
          categoria: 'A2',
          fechaVencimiento: '2030-01-01'
        },
        direccion: 'Calle 1'
      });
    });

    expect(() => {
      act(() => {
        result.current.crearCliente({
          nombre: 'Cliente Dos',
          tipoDocumento: 'CC',
          numeroDocumento: '111111111',
          telefono: '3002222222',
          email: 'dos@test.com',
          fechaNacimiento: '1991-01-01',
          licencia: {
            numero: 'LIC2',
            categoria: 'A2',
            fechaVencimiento: '2030-01-01'
          },
          direccion: 'Calle 2'
        });
      });
    }).toThrow('Ya existe un cliente con este número de documento');
  });

  it('updates client information', async () => {
    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let clientId: string;
    act(() => {
      const client = result.current.crearCliente({
        nombre: 'María García',
        tipoDocumento: 'CC',
        numeroDocumento: '987654321',
        telefono: '3009876543',
        email: 'maria@test.com',
        fechaNacimiento: '1992-05-15',
        licencia: {
          numero: 'LIC456',
          categoria: 'A2',
          fechaVencimiento: '2030-05-15'
        },
        direccion: 'Carrera 45'
      });
      clientId = client.id;
    });

    act(() => {
      result.current.actualizarCliente(clientId, { telefono: '3111111111' });
    });

    const updatedClient = result.current.clientes.find(c => c.id === clientId);
    expect(updatedClient?.telefono).toBe('3111111111');
  });

  it('deletes a client', async () => {
    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = result.current.clientes.length;

    let clientId: string;
    act(() => {
      const client = result.current.crearCliente({
        nombre: 'Cliente Temporal',
        tipoDocumento: 'CC',
        numeroDocumento: '555555555',
        telefono: '3005555555',
        email: 'temp@test.com',
        fechaNacimiento: '1995-01-01',
        licencia: {
          numero: 'LICTEMP',
          categoria: 'A2',
          fechaVencimiento: '2030-01-01'
        },
        direccion: 'Calle Temp'
      });
      clientId = client.id;
    });

    expect(result.current.clientes.length).toBe(initialCount + 1);

    act(() => {
      result.current.eliminarCliente(clientId);
    });

    expect(result.current.clientes.length).toBe(initialCount);
    expect(result.current.clientes.find(c => c.id === clientId)).toBeUndefined();
  });

  // # Esta prueba es la 3 para la HU 3.1
  it('searches clients by name, document, phone or email', async () => {
    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.crearCliente({
        nombre: 'Carlos Rodríguez',
        tipoDocumento: 'CC',
        numeroDocumento: '777777777',
        telefono: '3007777777',
        email: 'carlos@test.com',
        fechaNacimiento: '1988-08-08',
        licencia: {
          numero: 'LIC777',
          categoria: 'A2',
          fechaVencimiento: '2030-08-08'
        },
        direccion: 'Avenida 7'
      });
    });

    const resultsByName = result.current.buscarClientes('Carlos');
    expect(resultsByName.length).toBeGreaterThan(0);
    expect(resultsByName.some(c => c.nombre.includes('Carlos'))).toBe(true);

    const resultsByDoc = result.current.buscarClientes('777777777');
    expect(resultsByDoc.length).toBeGreaterThan(0);
    expect(resultsByDoc.some(c => c.numeroDocumento === '777777777')).toBe(true);
  });

  it('calculates client score correctly', async () => {
    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const score1 = result.current.calcularScore(5, 0);
    expect(score1).toBe(100);

    const score2 = result.current.calcularScore(10, 2);
    expect(score2).toBe(100);

    const score3 = result.current.calcularScore(0, 5);
    expect(score3).toBe(50);

    const score4 = result.current.calcularScore(20, 0);
    expect(score4).toBe(100);
  });
});
