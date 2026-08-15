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
    const muro = raw.indexOf('Confían en nosotros');
    // Sin esta precondición el test pasaría cuando el muro DESAPARECE:
    // indexOf devuelve -1 y -1 es menor que cualquier posición positiva.
    // Es decir, pasaría exactamente en la regresión que existe para detectar.
    expect(muro).toBeGreaterThan(-1);

    // La sección «Actualidad» se omite del HTML mientras la colección `blog`
    // esté vacía (guard en index.astro, antes de la Task 14). Sin entradas
    // no hay nada frente a lo cual ordenar el muro, así que la aserción de
    // orden solo se ejercita cuando la sección existe. En cuanto la Task 14
    // añada entradas, `blog` dejará de ser -1 y esta rama sí comprobará el
    // orden de verdad.
    const blog = raw.indexOf('Actualidad');
    if (blog > -1) {
      expect(muro).toBeLessThan(blog);
    }
  });

  it('ofrece las dos rutas de público', () => {
    expect(raw).toContain('Soy empresa');
    expect(raw).toContain('Soy persona');
  });
});
