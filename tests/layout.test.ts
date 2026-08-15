import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('pie de página (CRIT-04)', () => {
  const html = readFileSync('dist/index.html', 'utf-8');

  it('publica la dirección completa, no solo la ciudad', () => {
    expect(html).toContain('Carrera 87A # 32-81');
    expect(html).toContain('Laureles');
  });

  it('publica correo y horario', () => {
    expect(html).toContain('gerencia@mipc.com.co');
    expect(html).toContain('08:00');
  });
});
