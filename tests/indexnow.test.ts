import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * La clave de IndexNow.
 *
 * Se comprueba aquí y no solo dentro de `scripts/indexnow.mjs` porque el
 * script se corre a mano y a veces tarde: el fallo que importa —renombrar el
 * archivo, editarlo, dejar dos claves al rotar— tiene que salir en el build,
 * antes de desplegar, y no la próxima vez que alguien se acuerde de anunciar
 * URL.
 *
 * Bing pide la clave a `https://mipc.com.co/<clave>.txt` y compara el
 * contenido con el nombre. Si no coinciden, rechaza todos los avisos con un
 * 403 que no explica nada.
 */
describe('clave de IndexNow', () => {
  const candidatos = readdirSync('public').filter((f) => /^[0-9a-f]{8,128}\.txt$/i.test(f));

  it('hay exactamente una', () => {
    // Dos claves a la vez es el estado a medio rotar: el script no sabría
    // cuál mandar y el archivo viejo seguiría sirviéndose.
    expect(candidatos.length, `claves encontradas: ${candidatos.join(', ') || 'ninguna'}`).toBe(1);
  });

  it('el archivo contiene exactamente su propio nombre', () => {
    const archivo = candidatos[0];
    const contenido = readFileSync(join('public', archivo), 'utf-8');
    expect(contenido.trim()).toBe(archivo.replace(/\.txt$/i, ''));
  });

  it('se publica en la raíz del sitio construido', () => {
    // Vive en public/, así que Astro la copia tal cual a dist/. Si alguien la
    // mueve a src/ dejaría de servirse y nadie lo notaría hasta el 403.
    expect(existsSync(join('dist', candidatos[0]))).toBe(true);
  });

  it('no la bloquea robots.txt', () => {
    // Bing tiene que poder pedirla. Un Disallow que la tape rompe IndexNow
    // sin romper nada más, que es la clase de fallo que no se busca.
    const robots = readFileSync('dist/robots.txt', 'utf-8');
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
  });
});
