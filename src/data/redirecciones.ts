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

  // Restos de la tienda WooCommerce del WordPress. No estaban en ningún
  // sitemap —de ahí que la verificación del 2026-08-14 no los viera— y
  // aparecieron el 2026-09-19 mirando en GA4 qué páginas de entrada reales
  // responden 404: `/shop` recibió 23 sesiones en 35 días y la ficha de un
  // monitor, una.
  //
  // Van a `/servicios/` y no a `/`: quien tiene guardada la tienda es un
  // cliente buscando qué vende MiPC, y el listado de servicios es la página
  // que más se parece a esa intención. MiPC ya no vende producto suelto, así
  // que no hay un destino exacto; mandarlo a la portada sería perder lo poco
  // que se sabe de lo que venía a hacer.
  { de: '/shop', a: '/servicios/' },
  { de: '/shop/*', a: '/servicios/', ejemplo: '/shop/monitores/' },
  { de: '/monitor-aoc-24b30hm2', a: '/servicios/' },

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

/**
 * Las reglas tal como se despliegan: cada una, más su variante SIN barra
 * final.
 *
 * POR QUÉ HACE FALTA. Cloudflare solo normaliza la barra final de rutas que
 * existen. `/servicios` responde 307 a `/servicios/` porque `/servicios/`
 * existe; pero `/experiencia` da 404 seco, porque lo que existe es una regla
 * de redirección y no una página, y la regla estaba escrita solo con barra.
 *
 * Comprobado en producción el 2026-09-19: las DIECISIETE reglas fallaban sin
 * la barra. `/experiencia/` bien, `/experiencia` 404. `/home/contacto/` bien,
 * `/home/contacto` 404 —y esa recibió cuatro sesiones reales en 35 días—.
 *
 * Importa porque la forma sin barra es la que más se copia a mano: al dictar
 * una dirección, al pegarla en una conversación, al teclearla. El mapa cubría
 * justo la variante que menos se escribe.
 *
 * No se añade la variante si ya existe como origen propio, para no producir
 * dos líneas con el mismo `de` —la segunda sería inalcanzable— ni contradecir
 * una regla escrita a mano.
 */
export function reglasDesplegadas(): Array<{ de: string; a: string }> {
  const origenes = new Set(redirecciones.map((r) => r.de));
  const salida: Array<{ de: string; a: string }> = [];

  for (const r of redirecciones) {
    salida.push({ de: r.de, a: r.a });
    const sinBarra = r.de.replace(/\/$/, '');
    if (r.de.endsWith('/') && sinBarra && !origenes.has(sinBarra)) {
      salida.push({ de: sinBarra, a: r.a });
    }
  }
  return salida;
}
