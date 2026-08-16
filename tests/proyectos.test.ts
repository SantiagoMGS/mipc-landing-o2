import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

/**
 * Se comprueba contra `dist/`, no importando `src/data/fotos-proyectos.ts`.
 *
 * Dos razones. La primera es práctica: ese módulo importa archivos .webp, que
 * Vitest no resuelve sin el pipeline de assets de Astro. La segunda es mejor:
 * lo que le importa a un visitante no es que el módulo exporte una entrada,
 * es que la página construida traiga una imagen. Comprobar la salida atrapa
 * además los fallos que ocurren entre el dato y el HTML.
 */
const ids = readdirSync('src/content/proyectos')
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace('.md', ''));

const doc = (ruta: string) => parse(readFileSync(ruta, 'utf-8'));

describe('proyectos', () => {
  it('hay doce proyectos y cada uno construyó su página', () => {
    expect(ids.length).toBe(12);
    for (const id of ids) {
      expect(existsSync(`dist/proyectos/${id}/index.html`), `falta la página de ${id}`).toBe(true);
    }
  });

  it('el listado enlaza a todos, ninguno queda huérfano', () => {
    const html = readFileSync('dist/proyectos/index.html', 'utf-8');
    for (const id of ids) {
      expect(html, `el listado no enlaza ${id}`).toContain(`/proyectos/${id}/`);
    }
  });

  // Este es el punto de la sección entera. Un caso de estudio sin fotografía
  // de la obra es exactamente lo que había antes —tres narrativas verosímiles
  // sin nada detrás—, así que la falta de imagen tiene que ser un fallo, no
  // una página que sale más sosa.
  it('cada proyecto muestra al menos una foto real, optimizada por Astro', () => {
    for (const id of ids) {
      const imgs = doc(`dist/proyectos/${id}/index.html`)
        .querySelectorAll('article img')
        .map((i) => i.getAttribute('src') ?? '');
      const propias = imgs.filter((s) => s.includes('/_astro/'));
      expect(propias.length, `${id} no publica ninguna foto de obra`).toBeGreaterThan(0);
    }
  });

  it('cada foto lleva un alt que describe la escena', () => {
    for (const id of ids) {
      for (const img of doc(`dist/proyectos/${id}/index.html`).querySelectorAll('article img')) {
        const alt = img.getAttribute('alt') ?? '';
        expect(alt.length, `alt pobre en ${id}: "${alt}"`).toBeGreaterThan(40);
        expect(alt).not.toMatch(/\.(webp|jpe?g|png)$/i);
      }
    }
  });

  it('los servicios que se declaran existen como página', () => {
    for (const id of ids) {
      const enlaces = doc(`dist/proyectos/${id}/index.html`)
        .querySelectorAll('a[href^="/servicios/"]')
        .map((a) => a.getAttribute('href')!)
        .filter((h) => h !== '/servicios/');
      expect(enlaces.length, `${id} no declara ningún servicio`).toBeGreaterThan(0);
      for (const h of enlaces) {
        expect(existsSync(`dist${h}index.html`), `${id} enlaza a ${h}, que no existe`).toBe(true);
      }
    }
  });

  /**
   * La auditoría GEO del proyecto paralelo midió que en todo el sitio no
   * existía un solo bloque autocontenido de 134-167 palabras, que es la
   * longitud que los buscadores con IA extraen como respuesta. Cada página de
   * proyecto se escribió para llenar ese hueco. El umbral se pone en 120
   * porque el objetivo es que el texto exista, no acertar la cifra exacta.
   */
  it('cada proyecto trae un bloque de texto largo, no cuatro frases sueltas', () => {
    for (const id of ids) {
      const prosa = doc(`dist/proyectos/${id}/index.html`).querySelector('.prose');
      const palabras = (prosa?.text ?? '').trim().split(/\s+/).filter(Boolean).length;
      expect(palabras, `${id} tiene ${palabras} palabras de cuerpo`).toBeGreaterThanOrEqual(120);
    }
  });

  it('ya no queda rastro de los tres casos inventados', () => {
    expect(existsSync('src/content/casos')).toBe(false);
    const clientes = readFileSync('dist/clientes/index.html', 'utf-8');
    // Eran narrativas sin evidencia sobre clientes reales. Si alguien las
    // recupera de git, esto lo señala.
    expect(clientes).not.toContain('Una emisora no puede permitirse');
  });
});
