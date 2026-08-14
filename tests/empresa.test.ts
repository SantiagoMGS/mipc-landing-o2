import { describe, it, expect } from 'vitest';
import { empresa } from '../src/data/empresa';

describe('empresa (NAP)', () => {
  it('tiene el teléfono en formato E.164 para schema y enlaces tel:', () => {
    expect(empresa.telefonoE164).toBe('+573148889078');
  });

  it('tiene dirección completa, no solo la ciudad', () => {
    expect(empresa.direccion.calle).toBe('Carrera 87A # 32-81, Interior 305');
    expect(empresa.direccion.ciudad).toBe('Medellín');
    expect(empresa.direccion.barrio).toBe('Laureles');
  });

  it('tiene correo de contacto', () => {
    expect(empresa.email).toBe('gerencia@mipc.com.co');
  });

  it('declara al menos una franja horaria', () => {
    expect(empresa.horario.length).toBeGreaterThan(0);
  });

  it('es inmutable, para que nadie lo mute en tiempo de render', () => {
    expect(Object.isFrozen(empresa)).toBe(true);
  });
});
