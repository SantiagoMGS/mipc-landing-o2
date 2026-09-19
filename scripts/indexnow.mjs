/**
 * Avisa a Bing —y a los demás buscadores que hablan IndexNow— de que unas URL
 * cambiaron, en vez de esperar a que pasen a rastrear.
 *
 * QUÉ ES ESTO Y POR QUÉ EXISTE. Google no tiene nada equivalente: allí se
 * publica y se espera. Bing sí, y el 2026-09-19 se descubrió que importa más
 * de lo que parecía: ChatGPT se apoya en el índice de Bing, y la única clienta
 * atribuible a un asistente de IA llegó por ahí. Que Bing tarde dos semanas en
 * ver una página nueva es que el asistente tarda dos semanas en poder citarla.
 *
 * LA CLAVE NO ES UN SECRETO. IndexNow prueba la propiedad del dominio pidiendo
 * que la clave esté publicada en la raíz del sitio, así que por definición es
 * pública y va versionada: `public/<clave>.txt`. Lo único que permite es pedir
 * que se rastreen URL de ESTE dominio. Si se pierde, se genera otra y se borra
 * la anterior:
 *
 *   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
 *
 * CUÁNDO CORRERLO. Después de desplegar, no antes: IndexNow verifica la clave
 * pidiéndola al sitio en vivo, y anuncia URL que el buscador irá a leer. Si se
 * anuncia lo que todavía no está publicado, el buscador lee la versión vieja y
 * el aviso se gasta para nada. Es la misma regla que `check-redirecciones.mjs`.
 *
 * Uso:
 *   node scripts/indexnow.mjs                      # todo el sitemap
 *   node scripts/indexnow.mjs /rionegro/ /contacto/ # solo esas rutas
 *   node scripts/indexnow.mjs --simulacro          # enseña qué enviaría
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const HOST = 'mipc.com.co';
const BASE = `https://${HOST}`;
const PUNTO = 'https://api.indexnow.org/indexnow';

/** Tope de la API por petición. Más de esto hay que trocearlo. */
const MAXIMO = 10_000;

const args = process.argv.slice(2);
const simulacro = args.includes('--simulacro');
const rutas = args.filter((a) => !a.startsWith('--'));

/**
 * La clave se DEDUCE del archivo publicado en `public/`, no se escribe aquí.
 *
 * Así no hay dos sitios donde pueda estar y contradecirse. El archivo tiene
 * que existir y su nombre tiene que coincidir con su contenido: es lo que
 * comprueba el buscador antes de aceptar el aviso.
 */
function clave() {
  const candidatos = readdirSync('public').filter((f) => /^[0-9a-f]{8,128}\.txt$/i.test(f));
  if (candidatos.length !== 1) {
    console.error(
      candidatos.length === 0
        ? 'No hay ningún archivo de clave de IndexNow en public/.\n\n' +
          'Genera uno: el nombre es <clave>.txt y dentro va la misma clave, sin salto\n' +
          'de línea. La clave es hexadecimal, de 8 a 128 caracteres.'
        : `Hay ${candidatos.length} archivos que parecen claves de IndexNow en public/:\n` +
          `${candidatos.join(', ')}\n\nDeja solo el vigente y borra los demás.`
    );
    process.exit(1);
  }
  const archivo = candidatos[0];
  const esperada = archivo.replace(/\.txt$/i, '');
  const contenido = readFileSync(join('public', archivo), 'utf-8').trim();
  if (contenido !== esperada) {
    console.error(
      `El archivo public/${archivo} contiene «${contenido}», que no es su propio nombre.\n\n` +
      'El buscador pide la clave a esa URL y compara: si no coinciden, rechaza\n' +
      'todos los avisos sin decir por qué.'
    );
    process.exit(1);
  }
  return esperada;
}

/** Las URL del sitemap construido. Es la misma lista que ve un buscador. */
function delSitemap() {
  const indice = 'dist/sitemap-index.xml';
  let xml;
  try {
    xml = readFileSync(indice, 'utf-8');
  } catch {
    console.error(`Falta ${indice}. Corre «npm run build» antes.`);
    process.exit(1);
  }
  const hijos = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const hijo of hijos) {
    const local = join('dist', new URL(hijo).pathname.replace(/^\//, ''));
    for (const m of readFileSync(local, 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.push(m[1]);
    }
  }
  return urls;
}

const urls = rutas.length
  ? rutas.map((r) => new URL(r, BASE).href)
  : delSitemap();

if (!urls.length) {
  console.error('No hay ninguna URL que anunciar.');
  process.exit(1);
}
if (urls.length > MAXIMO) {
  console.error(`${urls.length} URL superan el tope de ${MAXIMO} por petición.`);
  process.exit(1);
}

const ajenas = urls.filter((u) => new URL(u).hostname !== HOST);
if (ajenas.length) {
  // IndexNow rechaza el lote entero —con 422— si una sola URL es de otro
  // dominio. Vale más decir cuál que leer el código de error.
  console.error(`Estas URL no son de ${HOST} y harían fallar todo el lote:\n${ajenas.join('\n')}`);
  process.exit(1);
}

const cuerpo = { host: HOST, key: clave(), keyLocation: `${BASE}/${clave()}.txt`, urlList: urls };

if (simulacro) {
  console.log(`Simulacro: se anunciarían ${urls.length} URL a ${PUNTO}\n`);
  for (const u of urls) console.log(`  ${u}`);
  console.log(`\nClave: ${cuerpo.key}  (publicada en ${cuerpo.keyLocation})`);
  process.exit(0);
}

const r = await fetch(PUNTO, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(cuerpo),
});

// La API responde 200 o 202 sin cuerpo. 403 es la clave mal publicada;
// 422 es una URL que no pertenece al host declarado.
if (r.status === 200 || r.status === 202) {
  console.log(`${urls.length} URL anunciadas a IndexNow (${r.status}).`);
  console.log('Anunciar no es indexar: el buscador decide si va, y cuándo.');
} else {
  console.error(`IndexNow respondió ${r.status}: ${await r.text()}`);
  if (r.status === 403) {
    console.error(
      `\nUn 403 es la clave. Comprueba que ${cuerpo.keyLocation} responde 200 y\n` +
      'devuelve exactamente la clave. Si acabas de añadirla, falta desplegar.'
    );
  }
  process.exit(1);
}
