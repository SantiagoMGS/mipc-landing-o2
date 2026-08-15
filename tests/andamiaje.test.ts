import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('andamiaje', () => {
  it('compila a dist/index.html', () => {
    expect(existsSync('dist/index.html')).toBe(true);
  });

  it('declara el idioma es-CO, no en-US', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    expect(html).toContain('lang="es-CO"');
    expect(html).not.toContain('en-US');
  });
});
