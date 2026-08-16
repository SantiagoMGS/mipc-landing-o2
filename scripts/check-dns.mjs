// Compara una zona DNS servida en vivo contra el archivo de referencia
// docs/dns/zona-mipc.com.co-2026-08-15.txt.
//
// PARA QUÉ EXISTE. `mipc.com.co` no solo sirve el sitio: sirve el correo de la
// empresa, incluido gerencia@mipc.com.co, que es donde llegan las
// cotizaciones. Cloudflare importa la zona automáticamente al añadir el
// dominio, pero **la importación no es verificación**: importa lo que consigue
// leer, y lo que no lea se pierde en silencio. Comparar veintitantos registros
// a ojo en un panel es exactamente donde se escapa el que faltaba.
//
// LO QUE LO HACE ÚTIL DE VERDAD: se le puede pasar un servidor de nombres
// concreto. Eso permite preguntar DIRECTAMENTE a los nameservers de Cloudflare
// mientras el registrador sigue apuntando a Hostinger — es decir, comprobar la
// zona importada ANTES de mover nada y sin ventana de riesgo. Si algo falta,
// se arregla en Cloudflare con el correo todavía funcionando en Hostinger.
//
// Uso:
//   node scripts/check-dns.mjs                          → resolver del sistema
//   node scripts/check-dns.mjs ana.ns.cloudflare.com    → los NS de Cloudflare
//
// Sale con 0 si todo lo que debe sobrevivir sobrevive, y con 1 si falta algo.

import { readFileSync } from 'node:fs';
import { Resolver, promises as dnsPromises } from 'node:dns';

const ZONA = 'docs/dns/zona-mipc.com.co-2026-08-16.txt';
const DOMINIO = 'mipc.com.co';

/**
 * Registros que APUNTAN AL SITIO y que el corte debe cambiar a propósito. No
 * son fallos: hoy llevan al WordPress de Hostinger (89.117.7.139) y después
 * del corte tienen que llevar al proyecto de Cloudflare. Se informan aparte
 * para que su cambio se vea y se confirme, en vez de mezclarse con el ruido.
 */
const DEL_SITIO = new Set(['@|A', 'www|CNAME']);

/**
 * Registros que el cliente decidió NO migrar el 2026-08-16. Su ausencia se
 * informa pero no es un fallo.
 *
 * El objetivo declarado del corte se reduce a tres cosas: la aplicación de
 * `admin.mipc.com.co`, la landing y el correo. Todo lo que no sirve a una de
 * las tres se deja caer: el bloque `coopebello` (un correo sobre subdominio
 * alojado en Hostinger), `os` y `app` (servicios viejos), `ftp` (alias de
 * conveniencia — el acceso FTP al hosting no depende de él) y `pruebaapp`
 * (un resto de verificación).
 *
 * Se quedan LISTADOS en el archivo de zona en vez de borrados, y se avisa en
 * cada ejecución, por dos motivos: la decisión sigue siendo visible en lugar
 * de convertirse en un olvido, y si mañana alguna ausencia duele, ahí están
 * los valores exactos para recrear el registro.
 *
 * `admin` NO está en esta lista y no debe entrar: es una aplicación en
 * producción.
 */
const RETIRADOS = new Set([
  'pruebaapp|TXT',
  'os|A',
  'app|A',
  'app|TXT',
  'ftp|A',
  'coopebello|MX',
  'coopebello|TXT',
  'autoconfig.coopebello|CNAME',
  'autodiscover.coopebello|CNAME',
  'hostingermail-a._domainkey.coopebello|CNAME',
  'hostingermail-b._domainkey.coopebello|CNAME',
  'hostingermail-c._domainkey.coopebello|CNAME',
]);

/** Tipos que cambian por definición al mover la zona; compararlos no informa. */
const IGNORADOS = new Set(['NS', 'SOA']);

const norm = (s) => s.trim().toLowerCase().replace(/\.$/, '');

/**
 * Quita el comentario de una línea de zona. El `;` solo comenta FUERA de
 * comillas: la clave DKIM de `krs._domainkey` es `"k=rsa; p=MIGf..."` y
 * cortar por el primer `;` la dejaba en `k=rsa`, es decir, comparando media
 * clave contra la entera y reportando que faltaba. Un falso positivo en este
 * script es tan caro como un falso negativo: enseña a desconfiar de él justo
 * el día que hay que hacerle caso.
 */
function sinComentario(linea) {
  let dentroDeComillas = false;
  for (let i = 0; i < linea.length; i++) {
    if (linea[i] === '"') dentroDeComillas = !dentroDeComillas;
    else if (linea[i] === ';' && !dentroDeComillas) return linea.slice(0, i);
  }
  return linea;
}

/**
 * Parser del archivo de zona. Lo único con truco son las líneas de
 * continuación: un registro múltiple (los cuatro MX de Google) escribe el
 * nombre solo en la primera línea y deja las demás con sangría. Una línea
 * sangrada hereda el propietario de la anterior.
 */
function leerZona(ruta) {
  const esperado = new Map(); // "nombre|TIPO" -> Set(rdata normalizado)
  let propietario = null;

  for (const cruda of readFileSync(ruta, 'utf-8').split('\n')) {
    const linea = sinComentario(cruda);
    if (!linea.trim() || linea.startsWith('$')) continue;

    const continuacion = /^\s/.test(cruda);
    const campos = linea.trim().split(/\s+/);
    if (!continuacion) propietario = campos.shift();
    if (!propietario) continue;

    // Quedan: TTL IN TIPO rdata... — se descarta el TTL, que no se compara.
    const [, clase, tipo, ...rdata] = campos;
    if (clase !== 'IN' || !tipo || IGNORADOS.has(tipo)) continue;

    // El TXT viene entrecomillado y puede traer comillas internas; se
    // reconstruye la cadena completa y se le quitan solo las de los extremos.
    const valor = tipo === 'TXT'
      ? rdata.join(' ').replace(/^"|"$/g, '')
      : norm(rdata.join(' '));

    const clave = `${propietario}|${tipo}`;
    if (!esperado.has(clave)) esperado.set(clave, new Set());
    esperado.get(clave).add(valor);
  }
  return esperado;
}

async function consultar(resolver, nombre, tipo) {
  const fqdn = nombre === '@' ? DOMINIO : `${nombre}.${DOMINIO}`;
  const pedir = (metodo) =>
    new Promise((res) => resolver[metodo](fqdn, (err, r) => res(err ? [] : r)));

  if (tipo === 'A') return (await pedir('resolve4')).map(norm);
  if (tipo === 'CNAME') return (await pedir('resolveCname')).map(norm);
  if (tipo === 'MX')
    return (await pedir('resolveMx')).map((m) => norm(`${m.priority} ${m.exchange}`));
  if (tipo === 'TXT') return (await pedir('resolveTxt')).map((t) => t.join(''));
  return [];
}

const servidor = process.argv[2];
const resolver = new Resolver();

if (servidor) {
  // setServers exige IPs, no nombres: se resuelve el del nameserver con el
  // resolver del sistema antes de apuntarle.
  const ips = await dnsPromises.resolve4(servidor).catch(() => []);
  if (!ips.length) {
    console.error(`No se pudo resolver el servidor de nombres "${servidor}".`);
    process.exit(1);
  }
  resolver.setServers(ips);
  console.log(`Consultando directamente a ${servidor} (${ips.join(', ')})\n`);
} else {
  console.log('Consultando con el resolver del sistema\n');
}

const esperado = leerZona(ZONA);

// Misma lección que scripts/check-html.mjs: un verificador que no verificó
// nada NO puede reportar éxito. Si el parser se rompe —o alguien mueve el
// archivo de zona— el bucle de abajo no itera, no hay fallos, y esto imprime
// «todo correcto» justo antes de que alguien mueva los nameservers confiando
// en ello. El archivo de referencia da 21 conjuntos, descontando SOA y NS.
// Este mínimo ya se ganó el sueldo: atrapó un parser que devolvía cero y
// dejaba pasar un «todos los registros correctos» sin haber mirado ninguno.
const MINIMO = 18;
if (esperado.size < MINIMO) {
  console.error(
    `Solo se interpretaron ${esperado.size} conjuntos de registros de ${ZONA}, y se ` +
    `esperaban al menos ${MINIMO}. El archivo cambió de formato o de sitio: no hay ` +
    `nada que verificar, y dar esto por bueno es peor que no correrlo.`
  );
  process.exit(1);
}

const fallos = [];
const avisos = [];
const delSitio = [];

for (const [clave, valores] of esperado) {
  const [nombre, tipo] = clave.split('|');
  const vivos = new Set(await consultar(resolver, nombre, tipo));
  const faltan = [...valores].filter((v) => !vivos.has(v));
  const sobran = [...vivos].filter((v) => !valores.has(v));

  if (DEL_SITIO.has(clave)) {
    delSitio.push(`  ${clave.padEnd(28)} esperado(antes): ${[...valores].join(', ') || '—'}\n` +
                  `  ${''.padEnd(28)} en vivo(ahora):  ${[...vivos].join(', ') || '—'}`);
    continue;
  }
  if (!faltan.length) continue;

  const detalle = `  ${clave.padEnd(28)} FALTA: ${faltan.join(', ')}` +
    (sobran.length ? `\n  ${''.padEnd(28)} (hay en su lugar: ${sobran.join(', ')})` : '');
  (RETIRADOS.has(clave) ? avisos : fallos).push(detalle);
}

if (delSitio.length) {
  console.log('REGISTROS DEL SITIO — deben cambiar con el corte, confirmar a ojo:');
  console.log(delSitio.join('\n') + '\n');
}
if (avisos.length) {
  console.log('RETIRADOS a propósito el 2026-08-16 — ausentes, como se decidió:');
  console.log(avisos.join('\n') + '\n');
}

if (fallos.length) {
  console.error(`${fallos.length} registro(s) que DEBEN sobrevivir no están:\n`);
  console.error(fallos.join('\n'));
  console.error('\nNO cambies los nameservers. Si ya los cambiaste, esto explica');
  console.error('qué se rompió: los MX y los TXT de SPF/DKIM son el correo.');
  process.exit(1);
}

const comprobados = esperado.size - delSitio.length;
console.log(`${comprobados} conjuntos de registros comprobados: todos los que deben`);
console.log('sobrevivir están presentes y correctos.');
