// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mipc.com.co',
  output: 'static',
  trailingSlash: 'always',
  // /gracias/ es útil al visitante pero no tiene valor en búsqueda: se
  // excluye del sitemap y además emite noindex desde el componente SEO.
  integrations: [sitemap({ filter: (url) => !url.includes('/gracias/') })],
  vite: { plugins: [tailwindcss()] },
});
