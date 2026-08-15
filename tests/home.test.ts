import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('home', () => {
  const raw = readFileSync('dist/index.html', 'utf-8');
  const doc = parse(raw);

  it('tiene exactamente una h1 (SEO-01)', () => {
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
  });

  it('el mensaje principal es empresarial, no de reparación a domicilio', () => {
    expect(doc.querySelector('h1')!.text.toLowerCase()).toContain('empresa');
  });

  it('el muro de clientes va antes que el blog', () => {
    expect(raw.indexOf('Confían en nosotros')).toBeLessThan(raw.indexOf('Actualidad'));
  });

  it('ofrece las dos rutas de público', () => {
    expect(raw).toContain('Soy empresa');
    expect(raw).toContain('Soy persona');
  });
});
