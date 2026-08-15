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

  it('las fechas se muestran en español, no en inglés', () => {
    const html = readFileSync('dist/blog/index.html', 'utf-8');
    expect(html).not.toMatch(/January|April|August/);
  });
});
