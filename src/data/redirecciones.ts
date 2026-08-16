/**
 * Mapa de URLs del sitio de WordPress a sus equivalentes en el sitio nuevo.
 *
 * Es la fuente única de verdad: el hook `astro:build:done` en
 * `astro.config.mjs` la lee para producir `dist/_redirects` (formato
 * Cloudflare Pages) en cada `astro build` —sin depender del ciclo de vida
 * `prebuild` de npm, que un `astro build` directo se salta—, y
 * `scripts/check-redirecciones.mjs` la usa para verificar, ya en producción,
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
 *
 * `ejemplo` solo hace falta en las reglas con comodín: el verificador pide
 * cada URL contra el dominio en vivo, y pedir literalmente una ruta con `*`
 * no comprueba la regla, comprueba una URL que no existe.
 */
export const redirecciones: Array<{ de: string; a: string; ejemplo?: string }> = [
  { de: '/home/servicios/', a: '/servicios/' },
  { de: '/home/servicios-mipc-tecnologia-copy/', a: '/nosotros/' },
  { de: '/servicios-mipc-tecnologia/', a: '/nosotros/' },
  { de: '/home/experiencia/', a: '/clientes/' },
  { de: '/home/actualidad/', a: '/blog/' },
  { de: '/home/contacto/', a: '/contacto/' },
  { de: '/home/', a: '/' },

  // Alias de primer nivel de dos entradas del menú actual. NO aparecen en
  // wp-sitemap.xml —por eso la verificación del 2026-08-14, hecha contra el
  // sitemap, no las vio— pero responden 200 en el sitio vivo y son las que
  // muestra el menú, así que son las formas que un enlace externo tendría
  // más probabilidad de haber copiado. Comprobado con curl el 2026-08-15.
  { de: '/experiencia/', a: '/clientes/' },
  { de: '/actualidad/', a: '/blog/' },

  { de: '/intel-anuncia-nuevos-procesadores-de-escritorio-core-de-12a-generacion/', a: '/blog/' },
  { de: '/amazon-anuncia-la-adquisicion-de-la-empresa-de-tecnologia-cuantica-psiquantum/', a: '/blog/' },
  { de: '/google-anuncia-actualizaciones-de-sus-productos-de-realidad-virtual-y-aumentada/', a: '/blog/' },

  { de: '/category/uncategorized/', a: '/blog/' },
  { de: '/author/santiago-martinezmipc-com-co/', a: '/' },
  { de: '/wp-sitemap.xml', a: '/sitemap-index.xml' },
  { de: '/feed/', a: '/blog/' },

  // Las imágenes y adjuntos de WordPress vivían bajo /wp-content/uploads/.
  // No aparecen en ningún sitemap —por eso la verificación contra los cuatro
  // sub-sitemaps no las vio— pero pueden estar indexadas en Google Imágenes o
  // enlazadas desde fuera, y son incontables una a una: la única forma de
  // cubrirlas es un comodín. Va al final porque Cloudflare aplica la primera
  // regla que coincide y ninguna regla exacta debe quedar por debajo de esta.
  //
  // Destino `/` y no una sección: bajo uploads había fotos, logotipos y PDF
  // sin equivalente en el sitio nuevo, y mandarlos todos a /proyectos/ sería
  // afirmar una correspondencia que no existe.
  {
    de: '/wp-content/uploads/*',
    a: '/',
    ejemplo: '/wp-content/uploads/2023/05/imagen-de-prueba.jpg',
  },
];
