// @ts-check
import { writeFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { redirecciones } from './src/data/redirecciones.ts';

/**
 * Escribe dist/_redirects (formato Cloudflare Pages) desde el hook
 * astro:build:done, en vez de depender del ciclo de vida `prebuild` de npm.
 *
 * Motivo: Cloudflare Pages puede estar configurado con `astro build` en vez
 * de `npm run build` (o volver a detectar el preset del framework y
 * descartar el comando personalizado). `prebuild` solo corre bajo npm, así
 * que un `astro build` directo producía un sitio sin ninguna redirección,
 * sin que nada lo notara antes del despliegue. Un hook de Astro corre
 * siempre que `astro build` corre, sea quien sea quien lo invoque.
 */
/** @returns {import('astro').AstroIntegration} */
function redirectsIntegration() {
  return {
    name: 'generar-redirects',
    hooks: {
      /** @param {{ dir: URL }} args */
      'astro:build:done': ({ dir }) => {
        const lineas = redirecciones.map((r) => `${r.de} ${r.a} 301`);
        writeFileSync(new URL('_redirects', dir), lineas.join('\n') + '\n');
      },
    },
  };
}

export default defineConfig({
  site: 'https://mipc.com.co',
  output: 'static',
  trailingSlash: 'always',
  // /gracias/ es útil al visitante pero no tiene valor en búsqueda: se
  // excluye del sitemap y además emite noindex desde el componente SEO.
  integrations: [
    sitemap({ filter: (url) => !url.includes('/gracias/') }),
    redirectsIntegration(),
  ],
  vite: { plugins: [tailwindcss()] },
});
