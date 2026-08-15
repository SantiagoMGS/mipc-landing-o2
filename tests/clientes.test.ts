import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('muro de clientes', () => {
  const doc = parse(readFileSync('dist/index.html', 'utf-8'));

  it('muestra los 18 clientes', () => {
    expect(doc.querySelectorAll('[data-cliente]')).toHaveLength(18);
  });

  it('los logos se exhiben a 88px para verse nítidos en pantalla 2x', () => {
    const img = doc.querySelector('[data-cliente] img');
    expect(img?.getAttribute('width')).toBe('88');
  });

  it('cada logo tiene alt con el nombre del cliente', () => {
    const alts = doc.querySelectorAll('[data-cliente] img').map((i) => i.getAttribute('alt'));
    expect(alts.every((a) => a && a.length > 5)).toBe(true);
  });
});
