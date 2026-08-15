import { describe, it, expect } from 'vitest';
import { franja } from '../src/lib/horario';

describe('franja', () => {
  it('rotula un rango cuando los días son consecutivos', () => {
    expect(
      franja({ dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], abre: '08:00', cierra: '18:00' })
    ).toBe('Lun a Vie: 08:00 a 18:00');
  });

  it('rotula un solo día sin "a"', () => {
    expect(franja({ dias: ['Saturday'], abre: '08:00', cierra: '12:00' })).toBe('Sáb: 08:00 a 12:00');
  });

  it('enumera los días, sin inventar un rango, cuando NO son consecutivos', () => {
    // Lun-Mié-Vie no es un rango: "Lun a Vie" anunciaría horario los martes
    // y jueves, días en que el negocio está cerrado.
    expect(
      franja({ dias: ['Monday', 'Wednesday', 'Friday'], abre: '09:00', cierra: '13:00' })
    ).toBe('Lun, Mié, Vie: 09:00 a 13:00');
  });
});
