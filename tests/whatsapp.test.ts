import { describe, it, expect } from 'vitest';
import { enlaceWhatsApp } from '../src/lib/whatsapp';

describe('enlaceWhatsApp', () => {
  it('apunta al número de la empresa', () => {
    expect(enlaceWhatsApp()).toContain('https://wa.me/573148889078');
  });

  it('precarga el mensaje codificado', () => {
    const url = enlaceWhatsApp('Hola, me interesa el servicio de cámaras de seguridad');
    expect(url).toContain('text=Hola%2C%20me%20interesa');
  });
});
