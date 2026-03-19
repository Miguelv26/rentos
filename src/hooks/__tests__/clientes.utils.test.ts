import { calculateAge, isAdult } from '@/hooks/clientes.utils';

describe('clientes.utils (HU 3.1)', () => {
  it('calculates age from birth date', () => {
    const age = calculateAge('2000-03-10', new Date('2026-03-18'));
    expect(age).toBe(26);
  });

  // # Esta prueba es la 2 para la HU 3.1
  it('validates legal age correctly', () => {
    expect(isAdult('2010-01-01')).toBe(false);
    expect(isAdult('1998-05-20')).toBe(true);
  });
});
