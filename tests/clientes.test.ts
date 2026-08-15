import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('muro de clientes', () => {
  const doc = parse(readFileSync('dist/index.html', 'utf-8'));

  it('muestra los 18 clientes', () => {
    expect(doc.querySelectorAll('[data-cliente]')).toHaveLength(18);
  });

  it('TODOS los logos se exhiben a 88px, no solo el primero', () => {
    const imgs = doc.querySelectorAll('[data-cliente] img');
    expect(imgs).toHaveLength(12);
    expect(imgs.every((i) => i.getAttribute('width') === '88')).toBe(true);
    expect(imgs.every((i) => i.getAttribute('height') === '52')).toBe(true);
  });

  it('cada alt nombra a su cliente, no es texto de relleno', () => {
    // Comprobar solo la longitud dejaría pasar un alt genérico repetido.
    // El slug del archivo no lleva tildes ni las siglas con puntos del
    // nombre real (p. ej. "eip-sas" vs "E.I.P."), así que la comparación
    // normaliza tildes y quita todo lo que no sea letra/dígito en ambos
    // lados en vez de exigir substring literal, que rompería con nombres
    // en español correctamente acentuados.
    const normalizar = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const imgs = doc.querySelectorAll('[data-cliente] img');
    for (const img of imgs) {
      const alt = img.getAttribute('alt') ?? '';
      const src = img.getAttribute('src') ?? '';
      const slug = src.split('/').pop()!.replace('.png', '');
      const primeraPalabra = slug.split('-')[0];
      expect(normalizar(alt)).toContain(normalizar(primeraPalabra));
      expect(alt).not.toContain('.png');
    }
  });

  it('las primeras marcas no van diferidas: el muro está arriba de la página', () => {
    const imgs = doc.querySelectorAll('[data-cliente] img');
    expect(imgs.slice(0, 6).every((i) => i.getAttribute('loading') === 'eager')).toBe(true);
  });
});
