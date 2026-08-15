import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('páginas estáticas', () => {
  it('todas existen y tienen una sola h1', () => {
    for (const p of ['nosotros', 'clientes', 'recursos', 'garantias']) {
      expect(existsSync(`dist/${p}/index.html`)).toBe(true);
      const doc = parse(readFileSync(`dist/${p}/index.html`, 'utf-8'));
      expect(doc.querySelectorAll('h1')).toHaveLength(1);
    }
  });

  it('recursos no enlaza a MEGA ni ofrece Pack Office', () => {
    const html = readFileSync('dist/recursos/index.html', 'utf-8');
    expect(html).not.toContain('mega.nz');
    expect(html).not.toContain('Pack Office');
  });

  it('recursos enlaza a los sitios oficiales', () => {
    const html = readFileSync('dist/recursos/index.html', 'utf-8');
    expect(html).toContain('anydesk.com');
    expect(html).toContain('crystalmark.info');
  });

  it('la 404 ofrece salida a los servicios', () => {
    const html = readFileSync('dist/404.html', 'utf-8');
    expect(html).toContain('/servicios/');
  });
});
