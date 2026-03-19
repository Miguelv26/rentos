import { applyTemplateString, shouldTrigger24hReminder } from '@/hooks/notificaciones.utils';

describe('notificaciones.utils (HU 3.3)', () => {
  // # Esta prueba es la 1 para la HU 3.3
  it('generates template string with placeholders', () => {
    const result = applyTemplateString('Hola {{cliente}}, reserva {{reservaId}}', {
      cliente: 'Juan',
      reservaId: 'res-1',
    });

    expect(result).toBe('Hola Juan, reserva res-1');
  });

  // # Esta prueba es la 2 para la HU 3.3
  it('triggers reminder inside 24h window', () => {
    const shouldSend = shouldTrigger24hReminder('2026-03-20T10:00:00.000Z', '2026-03-19T12:00:00.000Z');
    const shouldNotSend = shouldTrigger24hReminder('2026-03-20T10:00:00.000Z', '2026-03-18T08:00:00.000Z');

    expect(shouldSend).toBe(true);
    expect(shouldNotSend).toBe(false);
  });
});
