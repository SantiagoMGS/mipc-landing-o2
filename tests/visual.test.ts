import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

/** Astro puede inlinear hojas pequeñas, así que el CSS vive en dist/_astro o embebido en el HTML. */
function cssDelBuild(): string {
  let css = '';
  if (existsSync('dist/_astro')) {
    css += readdirSync('dist/_astro')
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf-8'))
      .join('\n');
  }
  css += readFileSync('dist/index.html', 'utf-8');
  return css.toLowerCase();
}

describe('sistema visual', () => {
  const css = cssDelBuild();

  it('usa la paleta exacta del spec', () => {
    expect(css).toContain('#f2f4f5');
    // El naranja de marca es el del logotipo vectorial. El spec original
    // decía #eb3a00, que era el del CSS del WordPress viejo; se corrigió al
    // adoptar el SVG real, porque el logo de la cabecera pinta #ff461a y dos
    // naranjas distintos en la misma pantalla se notan.
    expect(css).toContain('#ff461a');
    expect(css).not.toContain('#eb3a00');
    expect(css).toContain('#1e3a47');
    expect(css).toContain('#0f1620');
    expect(css).toContain('#d33400');
  });

  it('el naranja de marca coincide con el del logotipo que se sirve', () => {
    // La razón de ser del cambio anterior. Si alguien retoca el token sin
    // tocar el SVG (o al revés), esto falla en vez de dejar la cabecera con
    // el logo de un naranja y el subrayado de otro.
    const logo = readFileSync('public/logo-mipc.svg', 'utf-8').toLowerCase();
    expect(logo).toContain('#ff461a');
  });

  it('no enlaza Google Fonts: las fuentes van autoalojadas', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });
});
