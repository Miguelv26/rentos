import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast');

describe('useNotificaciones', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('sends a generic notification', async () => {
    const { result } = renderHook(() => useNotificaciones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let notificacion: any;
    await act(async () => {
      notificacion = await result.current.enviarNotificacion({
        tipo: 'confirmacion',
        destinatario: 'Juan Pérez',
        email: 'juan@test.com',
        asunto: 'Test Notification',
        mensaje: 'This is a test message'
      });
    });

    expect(notificacion).toBeDefined();
    expect(notificacion?.id).toContain('not-');
    expect(notificacion?.estado).toBeDefined();
  });

  it('sends reservation confirmation', async () => {
    const { result } = renderHook(() => useNotificaciones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let confirmacion: any;
    await act(async () => {
      confirmacion = await result.current.enviarConfirmacionReserva(
        'res-123',
        'María García',
        'maria@test.com',
        'Honda CB500',
        '20-25 Marzo'
      );
    });

    expect(confirmacion).toBeDefined();
    expect(confirmacion?.tipo).toBe('confirmacion');
    expect(confirmacion?.reservaId).toBe('res-123');
    expect(confirmacion?.asunto).toContain('Confirmación');
  });

  it('sends cancellation notification', async () => {
    const { result } = renderHook(() => useNotificaciones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let cancelacion: any;
    await act(async () => {
      cancelacion = await result.current.enviarCancelacion(
        'res-456',
        'Carlos López',
        'carlos@test.com'
      );
    });

    expect(cancelacion).toBeDefined();
    expect(cancelacion?.tipo).toBe('cancelacion');
    expect(cancelacion?.reservaId).toBe('res-456');
    expect(cancelacion?.mensaje).toContain('cancelada');
  });

  it('sends receipt notification', async () => {
    const { result } = renderHook(() => useNotificaciones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let recibo: any;
    await act(async () => {
      recibo = await result.current.enviarRecibo(
        'res-789',
        'Ana Martínez',
        'ana@test.com',
        250000
      );
    });

    expect(recibo).toBeDefined();
    expect(recibo?.tipo).toBe('recibo');
    expect(recibo?.reservaId).toBe('res-789');
    expect(recibo?.mensaje).toContain('250000');
  });

  it('stores notifications in localStorage', async () => {
    const { result } = renderHook(() => useNotificaciones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = result.current.notificaciones.length;

    await act(async () => {
      await result.current.enviarNotificacion({
        tipo: 'confirmacion',
        destinatario: 'Test User',
        email: 'test@test.com',
        asunto: 'Test',
        mensaje: 'Test message'
      });
    });

    expect(result.current.notificaciones.length).toBe(initialCount + 1);

    const saved = localStorage.getItem('rentos_notificaciones');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed.length).toBe(initialCount + 1);
  });

  it('shows toast on successful send', async () => {
    const { result } = renderHook(() => useNotificaciones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const notif = await result.current.enviarNotificacion({
        tipo: 'confirmacion',
        destinatario: 'Test User',
        email: 'test@test.com',
        asunto: 'Test',
        mensaje: 'Test message'
      });

      if (notif.estado === 'enviado') {
        expect(toast.success).toHaveBeenCalled();
      }
    });
  });

  // # Esta prueba es la 3 para la HU 3.3
  it('processes 24h queue and registers send logs', async () => {
    const { result } = renderHook(() => useNotificaciones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.scheduleReminder24h({
        reservaId: 'res-900',
        destinatario: 'Cliente Programado',
        email: 'programado@test.com',
        vehiculo: 'Yamaha MT-03',
        fechaInicio: '2026-03-20T10:00:00.000Z',
      });
    });

    await act(async () => {
      await result.current.processScheduledReminders('2026-03-19T12:00:00.000Z');
    });

    expect(result.current.notificaciones.some((item) => item.reservaId === 'res-900')).toBe(true);
    expect(result.current.programadas.find((item) => item.reservaId === 'res-900')?.estado).toBe('enviado');
  });
});
