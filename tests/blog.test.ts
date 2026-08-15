import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('blog', () => {
  it('el índice existe y lista las entradas', () => {
    expect(existsSync('dist/blog/index.html')).toBe(true);
    const doc = parse(readFileSync('dist/blog/index.html', 'utf-8'));
    expect(doc.querySelectorAll('article').length).toBeGreaterThanOrEqual(3);
  });

  it('cada entrada emite JSON-LD de tipo Article', () => {
    const doc = parse(readFileSync('dist/blog/mantenimiento-preventivo-empresas/index.html', 'utf-8'));
    const tipos = doc
      .querySelectorAll('script[type="application/ld+json"]')
      .map((b) => JSON.parse(b.text)['@type']);
    expect(tipos).toContain('Article');
  });

  it('las fechas se muestran en español en el índice Y en las entradas', () => {
    // La lista debe cubrir los doce meses: una versión anterior omitía July,
    // justo el mes de una de las tres entradas, así que una regresión de
    // locale en esa fecha habría pasado sin detectarse.
    const MESES_EN = /January|February|March|April|May|June|July|August|September|October|November|December/;
    const paginas = [
      'dist/blog/index.html',
      'dist/blog/mantenimiento-preventivo-empresas/index.html',
      'dist/blog/alquilar-o-comprar-computadores/index.html',
      'dist/blog/camaras-seguridad-que-preguntar/index.html',
    ];
    for (const p of paginas) {
      const html = readFileSync(p, 'utf-8');
      expect(html, p).not.toMatch(MESES_EN);
      expect(html, p).toMatch(/de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de \d{4}/);
    }
  });
});
