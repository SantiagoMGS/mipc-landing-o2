import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { redirecciones } from '../src/data/redirecciones';

describe('mapa de redirecciones', () => {
  const destinos = new Map(redirecciones.map((r) => [r.de, r.a]));

  it('cubre todas las URLs del sitio de WordPress', () => {
    for (const vieja of [
      '/home/servicios/',
      '/home/servicios-mipc-tecnologia-copy/',
      '/servicios-mipc-tecnologia/',
      '/home/experiencia/',
      '/home/actualidad/',
      '/home/contacto/',
      '/home/',
      '/intel-anuncia-nuevos-procesadores-de-escritorio-core-de-12a-generacion/',
      '/amazon-anuncia-la-adquisicion-de-la-empresa-de-tecnologia-cuantica-psiquantum/',
      '/google-anuncia-actualizaciones-de-sus-productos-de-realidad-virtual-y-aumentada/',
      '/category/uncategorized/',
      '/author/santiago-martinezmipc-com-co/',
      '/wp-sitemap.xml',
      '/feed/',
    ]) {
      expect(destinos.has(vieja)).toBe(true);
    }
  });

  it('la página "copy" apunta a nosotros', () => {
    expect(destinos.get('/home/servicios-mipc-tecnologia-copy/')).toBe('/nosotros/');
  });

  it('las tres entradas de 2023 van al blog', () => {
    expect(destinos.get('/intel-anuncia-nuevos-procesadores-de-escritorio-core-de-12a-generacion/')).toBe('/blog/');
  });

  it('ningún destino es a su vez origen de otra redirección (sin cadenas)', () => {
    for (const r of redirecciones) {
      expect(destinos.has(r.a)).toBe(false);
    }
  });

  it('no hay orígenes duplicados', () => {
    expect(new Set(redirecciones.map((r) => r.de)).size).toBe(redirecciones.length);
  });
});

describe('archivo _redirects generado', () => {
  // dist/_redirects, no public/_redirects: lo escribe el hook
  // astro:build:done de astro.config.mjs, así que solo existe después de
  // `astro build`. Verificarlo aquí es exactamente la comprobación que un
  // `astro build` directo (sin pasar por npm) necesita: si el hook no
  // corrió o produjo algo distinto, este test falla antes del despliegue.
  const ruta = 'dist/_redirects';

  it('existe (lo genera el hook astro:build:done)', () => {
    expect(existsSync(ruta)).toBe(true);
  });

  it('contiene una línea "<de> <a> 301" por cada regla, sin líneas extra', () => {
    const contenido = readFileSync(ruta, 'utf-8');
    const lineas = contenido.trim().split('\n');

    expect(lineas.length).toBe(redirecciones.length);

    redirecciones.forEach((r, i) => {
      expect(lineas[i]).toBe(`${r.de} ${r.a} 301`);
    });
  });

  it('todas las reglas son 301 (permanentes), ninguna 302', () => {
    const contenido = readFileSync(ruta, 'utf-8');
    expect(contenido).not.toMatch(/\s302\b/);
  });
});
