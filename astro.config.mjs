// @ts-check
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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

/**
 * Quita los comentarios HTML de las páginas construidas.
 *
 * Un comentario HTML NO desaparece al publicar: viaja íntegro a cada
 * visitante. El 2026-08-16 se midió que producción publicaba notas internas
 * sobre `gclid` y la plantilla de conversiones offline de Google Ads en
 * `/contacto/`, y siete comentarios en `/garantias/` — entre ellos uno que
 * empezaba diciendo «no se publica, es un comentario HTML». Se publicaba.
 *
 * Importa por dos motivos, y el segundo pesa más. Uno: son bytes que no le
 * sirven a nadie. Dos: un rastreador de IA los lee como texto de la página,
 * de modo que las notas internas sobre el estado legal del articulado de
 * garantías entraban en el contenido indexable junto al articulado mismo.
 *
 * Se hace aquí, sobre la salida, y no en el Markdown, por dos razones. La
 * primera es que cubre los dos orígenes a la vez —.md y .astro— en un solo
 * sitio. La segunda es que `markdown.remarkPlugins` exige instalar
 * `@astrojs/markdown-remark`, lo que cambiaría el procesador de Markdown de
 * todo el sitio (hoy Sätteri) para resolver un problema de saneamiento de
 * salida: demasiado radio de acción para el tamaño del arreglo.
 *
 * En las plantillas .astro conviene igualmente usar la forma de comentario
 * JSX, que Astro no emite: así ni siquiera llega hasta aquí.
 *
 * Lo que se salta a propósito es el interior de `script` y `style`, donde la
 * secuencia de apertura de comentario puede ser parte de una cadena. El
 * JSON-LD viaja con el signo de menor ya escapado desde SEO.astro, así que
 * tampoco se toca.
 *
 * `scripts/check-html.mjs` comprueba después que no quedó ninguno: esto es la
 * corrección y aquello la red.
 */
function quitarComentariosHtml() {
  const PROTEGIDO = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
  const COMENTARIO = /<!--[\s\S]*?-->/g;

  // El marcador va entre caracteres NUL a propósito. Uno legible —del tipo
  // ` 0 `— puede aparecer tal cual en el texto de una página («desde 2009»,
  // «30 días»), y al reponer los bloques se sustituiría texto real por un
  // script. NUL no aparece en el HTML que genera Astro, así que no colisiona.
  const MARCA = /\0(\d+)\0/g;

  /** @param {string} html */
  const limpiar = (html) => {
    /** @type {string[]} */
    const guardados = [];
    // Se aparta script y style, se limpia el resto, y se devuelven a su sitio.
    const marcado = html.replace(PROTEGIDO, (bloque) => `\0${guardados.push(bloque) - 1}\0`);
    return marcado.replace(COMENTARIO, '').replace(MARCA, (_, i) => guardados[Number(i)]);
  };

  /** @returns {import('astro').AstroIntegration} */
  return {
    name: 'quitar-comentarios-html',
    hooks: {
      /** @param {{ dir: URL }} args */
      'astro:build:done': ({ dir }) => {
        const raiz = fileURLToPath(dir);
        for (const relativa of globSync('**/*.html', { cwd: raiz })) {
          const archivo = join(raiz, relativa);
          const antes = readFileSync(archivo, 'utf-8');
          const despues = limpiar(antes);
          if (despues !== antes) writeFileSync(archivo, despues);
        }
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
    quitarComentariosHtml(),
  ],
  vite: { plugins: [tailwindcss()] },
});
