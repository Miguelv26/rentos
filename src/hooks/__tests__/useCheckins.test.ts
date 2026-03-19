import { renderHook, act } from '@testing-library/react';
import { CHECKLIST_DEFAULT } from '@/data/HU2_CheckinData';
import { useCheckins, validateInspectionNumbers } from '@/hooks/useCheckins';

describe('useCheckins (HU 2.3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // # Esta prueba es la 1 para la HU 2.3
  it('saves checklist in local storage', () => {
    const { result } = renderHook(() => useCheckins());

    act(() => {
      result.current.saveInspection({
        reservaId: 'res-1',
        vehiculoId: 1,
        tipo: 'check-in',
        kilometraje: 1500,
        nivelCombustible: 80,
        checklist: { ...CHECKLIST_DEFAULT, llantas: false },
        fotos: ['https://test.com/foto.jpg'],
        observaciones: 'Llantas desgastadas',
      });
    });

    const persisted = JSON.parse(localStorage.getItem('rentos_inspecciones') || '[]');
    expect(persisted).toHaveLength(1);
    expect(persisted[0].checklist.llantas).toBe(false);
  });

  // # Esta prueba es la 2 para la HU 2.3
  it('validates numeric fields', () => {
    expect(validateInspectionNumbers(-1, 80)).toContain('kilometraje');
    expect(validateInspectionNumbers(1000, 101)).toContain('combustible');
    expect(validateInspectionNumbers(1000, 50)).toBeNull();
  });
});
