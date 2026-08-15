import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { empresa } from '../src/data/empresa';

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
    expect(html).toContain('deskin.io');
    expect(html).toContain('crystalmark.info');
  });

  it('la 404 ofrece salida a los servicios', () => {
    const html = readFileSync('dist/404.html', 'utf-8');
    expect(html).toContain('/servicios/');
  });

  it('garantías publica la dirección canónica, no una copia vieja', () => {
    const html = readFileSync('dist/garantias/index.html', 'utf-8');
    // Aserción a nivel de página, no del cuerpo: la dirección llega aquí por
    // el pie, desde empresa.ts. Exigirla en el cuerpo obligaría a escribirla
    // a mano en el Markdown legal, creando una segunda fuente de verdad del
    // NAP — justamente lo que este proyecto elimina.
    expect(html).toContain(empresa.direccion.calle);
    expect(html).not.toContain('87A');
    expect(html).not.toContain('34-26');
  });

  it('el cuerpo legal de garantías realmente se renderizó', () => {
    // La aserción de arriba pasaría igual con el <article> completo borrado,
    // porque la dirección la aporta el pie en cualquier página. Esta prueba
    // el contenido propio de la página: una frase que solo existe en el
    // texto legal migrado (cláusula 4.2, reembolso por producto DOA), no en
    // el pie, el header ni ninguna otra plantilla del sitio.
    const html = readFileSync('dist/garantias/index.html', 'utf-8');
    expect(html).toContain('Dead on Arrival');
  });
});
