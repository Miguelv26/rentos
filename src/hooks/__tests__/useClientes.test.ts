import { renderHook, act, waitFor } from '@testing-library/react';
import { useClientes } from '@/hooks/useClientes';
import { api } from '@/lib/api';
import { Cliente } from '@/data/ClientesData';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const buildClienteInput = (overrides: Partial<Omit<Cliente, 'id' | 'reservasTotales' | 'totalGastado' | 'cancelaciones' | 'score' | 'incidentes'>> = {}) => ({
  nombre: 'Juan Pérez',
  tipoDocumento: 'CC' as const,
  numeroDocumento: '123456789',
  telefono: '3001234567',
  email: 'juan@test.com',
  fechaNacimiento: '1990-01-01',
  licencia: {
    numero: 'LIC123',
    categoria: 'A2',
    fechaVencimiento: '2030-01-01',
  },
  direccion: 'Calle 123',
  ...overrides,
});

describe('useClientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea un cliente y reemplaza el temporal con la respuesta del backend', async () => {
    mockedApi.get.mockResolvedValueOnce([
      {
        id: 'cli-base',
        ...buildClienteInput({ numeroDocumento: '999999999', email: 'base@test.com' }),
        reservasTotales: 0,
        totalGastado: 0,
        cancelaciones: 0,
        score: 100,
        incidentes: [],
      },
    ] as Cliente[]);
    mockedApi.post.mockResolvedValueOnce({
      id: 'cli-100',
      ...buildClienteInput(),
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: 100,
      incidentes: [],
    } as Cliente);

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: Cliente | undefined;
    await act(async () => {
      created = await result.current.crearCliente(buildClienteInput());
    });

    expect(created?.id).toBe('cli-100');
    expect(created?.telefono).toBe('3001234567');
    expect(created?.direccion).toBe('Calle 123');
    expect(result.current.clientes.some((cliente) => cliente.id === 'cli-100')).toBe(true);
  });

  it('impide crear clientes con documento duplicado', async () => {
    mockedApi.get.mockResolvedValueOnce([
      {
        id: 'cli-1',
        ...buildClienteInput(),
        reservasTotales: 0,
        totalGastado: 0,
        cancelaciones: 0,
        score: 100,
        incidentes: [],
      },
    ] as Cliente[]);

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.crearCliente(buildClienteInput())).rejects.toThrow(
      'Ya existe un cliente con este número de documento',
    );
  });

  it('actualiza la información de un cliente por api', async () => {
    mockedApi.get.mockResolvedValueOnce([
      {
        id: 'cli-2',
        ...buildClienteInput({ telefono: '3000000000', numeroDocumento: '222222222' }),
        reservasTotales: 0,
        totalGastado: 0,
        cancelaciones: 0,
        score: 100,
        incidentes: [],
      },
    ] as Cliente[]);

    mockedApi.patch.mockResolvedValueOnce({
      id: 'cli-2',
      ...buildClienteInput({ telefono: '3111111111', numeroDocumento: '222222222' }),
      reservasTotales: 0,
      totalGastado: 0,
      cancelaciones: 0,
      score: 100,
      incidentes: [],
    } as Cliente);

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.actualizarCliente('cli-2', { telefono: '3111111111' });
    });

    const updatedClient = result.current.clientes.find((cliente) => cliente.id === 'cli-2');
    expect(updatedClient?.telefono).toBe('3111111111');
    expect(mockedApi.patch).toHaveBeenCalledWith('/clientes/cli-2', expect.objectContaining({ telefono: '3111111111' }));
  });

  it('elimina un cliente por api', async () => {
    mockedApi.get.mockResolvedValueOnce([
      {
        id: 'cli-3',
        ...buildClienteInput({ numeroDocumento: '333333333' }),
        reservasTotales: 0,
        totalGastado: 0,
        cancelaciones: 0,
        score: 100,
        incidentes: [],
      },
    ] as Cliente[]);
    mockedApi.delete.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.eliminarCliente('cli-3');
    });

    expect(result.current.clientes.find((cliente) => cliente.id === 'cli-3')).toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith('/clientes/cli-3');
  });

  it('busca clientes por nombre, documento, teléfono o email', async () => {
    mockedApi.get.mockResolvedValueOnce([
      {
        id: 'cli-4',
        ...buildClienteInput({
          nombre: 'Carlos Rodríguez',
          numeroDocumento: '777777777',
          telefono: '3007777777',
          email: 'carlos@test.com',
        }),
        reservasTotales: 0,
        totalGastado: 0,
        cancelaciones: 0,
        score: 100,
        incidentes: [],
      },
    ] as Cliente[]);

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.buscarClientes('Carlos')).toHaveLength(1);
    expect(result.current.buscarClientes('777777777')).toHaveLength(1);
    expect(result.current.buscarClientes('3007777777')).toHaveLength(1);
    expect(result.current.buscarClientes('carlos@test.com')).toHaveLength(1);
  });

  it('calcula el score del cliente correctamente', async () => {
    mockedApi.get.mockResolvedValueOnce([
      {
        id: 'cli-score',
        ...buildClienteInput({ numeroDocumento: '444444444', email: 'score@test.com' }),
        reservasTotales: 0,
        totalGastado: 0,
        cancelaciones: 0,
        score: 100,
        incidentes: [],
      },
    ] as Cliente[]);

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.calcularScore(5, 0)).toBe(100);
    expect(result.current.calcularScore(10, 2)).toBe(100);
    expect(result.current.calcularScore(0, 5)).toBe(60);
    expect(result.current.calcularScore(20, 0)).toBe(100);
  });
});
