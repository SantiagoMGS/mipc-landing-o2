/**
 * Mapa de URLs del sitio de WordPress a sus equivalentes en el sitio nuevo.
 *
 * Es la fuente única de verdad: `scripts/generar-redirecciones.mjs` la lee
 * para producir `public/_redirects` (formato Cloudflare Pages) en cada build,
 * y `scripts/check-redirecciones.mjs` la usa para verificar, ya en producción,
 * que cada URL vieja responde con el 301 correcto.
 *
 * Verificado contra el sitemap real de WordPress (wp-sitemap.xml y sus
 * cuatro sub-sitemaps de posts, páginas, categorías y usuarios) el
 * 2026-08-14. Dos páginas del sitemap viejo — /garantias/ y /recursos/ — no
 * aparecen aquí a propósito: conservan la misma ruta en el sitio nuevo, así
 * que no son una redirección sino la misma URL sirviendo contenido nuevo.
 *
 * Reglas que debe cumplir este mapa (las prueba tests/redirecciones.test.ts):
 * - Todas son 301 (permanentes), nunca 302.
 * - Ningún destino («a») es a su vez origen («de») de otra fila: eso
 *   crearía una cadena de redirecciones, que pierde señal y añade latencia.
 * - No hay orígenes duplicados.
 */
export const redirecciones: Array<{ de: string; a: string }> = [
  { de: '/home/servicios/', a: '/servicios/' },
  { de: '/home/servicios-mipc-tecnologia-copy/', a: '/nosotros/' },
  { de: '/servicios-mipc-tecnologia/', a: '/nosotros/' },
  { de: '/home/experiencia/', a: '/clientes/' },
  { de: '/home/actualidad/', a: '/blog/' },
  { de: '/home/contacto/', a: '/contacto/' },
  { de: '/home/', a: '/' },

  { de: '/intel-anuncia-nuevos-procesadores-de-escritorio-core-de-12a-generacion/', a: '/blog/' },
  { de: '/amazon-anuncia-la-adquisicion-de-la-empresa-de-tecnologia-cuantica-psiquantum/', a: '/blog/' },
  { de: '/google-anuncia-actualizaciones-de-sus-productos-de-realidad-virtual-y-aumentada/', a: '/blog/' },

  { de: '/category/uncategorized/', a: '/blog/' },
  { de: '/author/santiago-martinezmipc-com-co/', a: '/' },
  { de: '/wp-sitemap.xml', a: '/sitemap-index.xml' },
  { de: '/feed/', a: '/blog/' },
];
