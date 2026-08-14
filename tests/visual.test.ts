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
    expect(css).toContain('#eb3a00');
    expect(css).toContain('#1e3a47');
  });

  it('no enlaza Google Fonts: las fuentes van autoalojadas', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });
});
