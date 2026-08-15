import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

const slugs = [
  'soporte-ti-empresarial', 'reparacion-de-computadores', 'camaras-de-seguridad',
  'redes-de-datos', 'alquiler-de-computadores',
];

describe('páginas de servicio', () => {
  it('cada servicio tiene su propia URL', () => {
    for (const s of slugs) {
      expect(existsSync(`dist/servicios/${s}/index.html`)).toBe(true);
    }
  });

  it('cada una tiene exactamente una h1 con la ciudad', () => {
    for (const s of slugs) {
      const doc = parse(readFileSync(`dist/servicios/${s}/index.html`, 'utf-8'));
      const h1 = doc.querySelectorAll('h1');
      expect(h1).toHaveLength(1);
      expect(h1[0].text).toContain('Medellín');
    }
  });

  it('cada una emite JSON-LD de tipo Service', () => {
    for (const s of slugs) {
      const doc = parse(readFileSync(`dist/servicios/${s}/index.html`, 'utf-8'));
      const tipos = doc
        .querySelectorAll('script[type="application/ld+json"]')
        .map((b) => JSON.parse(b.text)['@type']);
      expect(tipos).toContain('Service');
    }
  });

  it('alquiler habla de alquiler y no de redes (CONT-01)', () => {
    const html = readFileSync('dist/servicios/alquiler-de-computadores/index.html', 'utf-8');
    expect(html).toContain('por contrato');
    expect(html).not.toContain('administración de redes de datos y eléctricas');
  });
});
