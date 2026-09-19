/**
 * Cliente de la API de datos de GA4, sin dependencias.
 *
 * Hermano de `gsc.mjs` y por los mismos motivos: `googleapis` pesa decenas de
 * megas y acabaría en el `package.json` del sitio para un script que CI no
 * ejecuta. Firmar un JWT, canjearlo y llamar a un REST cabe en `node:crypto`
 * y `fetch`.
 *
 * QUÉ RESPONDE ESTO QUE NO RESPONDA SEARCH CONSOLE. Search Console dice qué se
 * buscó en Google. Esto dice de dónde llegó la gente y qué hizo al llegar,
 * incluidos los canales que no son Google. Se escribió el 2026-09-19 para una
 * pregunta concreta: una clienta contó que llegó porque le describió a ChatGPT
 * su necesidad de redes y cámaras y le nombró a MiPC. Hacía falta saber si eso
 * era una anécdota o un canal.
 *
 * CREDENCIALES: el MISMO JSON de cuenta de servicio que usa `gsc.mjs`
 * (~/.config/mipc/gsc.json, o $GSC_CREDENCIALES), fuera del repositorio.
 *
 * Son TRES permisos distintos y ninguno implica a los otros:
 *   1. API de datos de GA4 habilitada en el proyecto de Google Cloud.
 *   2. API de administración de GA4 habilitada, solo para `propiedades`.
 *   3. La cuenta de servicio dada de alta como Lector de la propiedad, en
 *      GA4 → Administrar → Accesos a la propiedad.
 * Los tres fallan con 403 y el mensaje no siempre dice cuál falta. Si algo no
 * responde, empezar por `propiedades`.
 *
 * Uso:
 *   node scripts/ga4.mjs propiedades
 *   node scripts/ga4.mjs canales      [--desde AAAA-MM-DD] [--hasta AAAA-MM-DD]
 *   node scripts/ga4.mjs asistentes
 *   node scripts/ga4.mjs detalle --fuente chatgpt.com
 *   node scripts/ga4.mjs eventos
 *
 * Opciones comunes:
 *   --propiedad <id>   por defecto 550105266 (mipc.com.co)
 *   --json <ruta>      guarda la respuesta cruda, para comparar dentro de un mes
 */

import { createSign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ALCANCE = 'https://www.googleapis.com/auth/analytics.readonly';
const DATOS = 'https://analyticsdata.googleapis.com/v1beta';
const ADMIN = 'https://analyticsadmin.googleapis.com/v1beta';

/**
 * Fecha del corte de dominio, igual que en `gsc.mjs`. Antes de esa fecha los
 * datos son del WordPress viejo y no comparan con nada de lo que hay hoy.
 */
const CORTE = '2026-08-16';

/**
 * Fuentes que GA4 marca como asistentes de IA, más las que aún no clasifica.
 *
 * GA4 ya tiene un canal propio —`ai-assistant`— pero no cubre a todos: según
 * qué asistente y cómo enlace, el tráfico puede caer en `referral` con el
 * dominio en la fuente. Por eso aquí se busca por FUENTE y no por canal: un
 * filtro por canal se perdería justo los que todavía no están clasificados.
 *
 * Lo que ninguna lista puede capturar: cuando el asistente NOMBRA la empresa
 * sin dar enlace y la persona escribe el dominio. Esa visita entra como
 * directa y es indistinguible de cualquier otra. Ver Atribucion.astro.
 */
const ASISTENTES = [
  'chatgpt.com', 'chat.openai.com', 'openai.com',
  'perplexity.ai', 'www.perplexity.ai',
  'claude.ai', 'gemini.google.com', 'copilot.microsoft.com',
];

const [, , comando, ...resto] = process.argv;

function opcion(nombre, porDefecto) {
  const i = resto.indexOf(`--${nombre}`);
  return i >= 0 && resto[i + 1] ? resto[i + 1] : porDefecto;
}

const propiedad = opcion('propiedad', '550105266');
const rutaJson = opcion('json', null);

const iso = (d) => d.toISOString().slice(0, 10);
const hoy = iso(new Date());
const desde = opcion('desde', CORTE);
const hasta = opcion('hasta', hoy);

// --- Credenciales -----------------------------------------------------------

function credenciales() {
  const ruta = process.env.GSC_CREDENCIALES ?? join(homedir(), '.config', 'mipc', 'gsc.json');
  try {
    const json = JSON.parse(readFileSync(ruta, 'utf-8'));
    if (!json.client_email || !json.private_key) {
      throw new Error('al JSON le faltan client_email o private_key');
    }
    return json;
  } catch (e) {
    console.error(
      `No se pudieron leer las credenciales en ${ruta}: ${e.message}\n\n` +
      'Se espera el JSON de una cuenta de servicio dada de alta como Lector de\n' +
      'la propiedad de GA4. Ponlo fuera del repositorio.'
    );
    process.exit(1);
  }
}

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function token() {
  const { client_email, private_key } = credenciales();
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = b64url(
    JSON.stringify({ iss: client_email, scope: ALCANCE, aud: TOKEN_URL, iat: ahora, exp: ahora + 3600 })
  );
  const firma = b64url(createSign('RSA-SHA256').update(`${cabecera}.${cuerpo}`).sign(private_key));

  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${cabecera}.${cuerpo}.${firma}`,
    }),
  });
  const datos = await r.json();
  if (!r.ok) {
    console.error(
      `Google rechazó las credenciales (${r.status}): ${datos.error_description ?? datos.error}\n\n` +
      'Si dice «invalid_grant», suele ser el reloj del sistema desfasado o una\n' +
      'clave revocada.'
    );
    process.exit(1);
  }
  return datos.access_token;
}

let cacheToken = null;
const autorizacion = async () => `Bearer ${(cacheToken ??= await token())}`;

/** Un informe de la API de datos. Devuelve filas ya aplanadas. */
async function informe(cuerpo) {
  const r = await fetch(`${DATOS}/properties/${propiedad}:runReport`, {
    method: 'POST',
    headers: { authorization: await autorizacion(), 'content-type': 'application/json' },
    body: JSON.stringify({ dateRanges: [{ startDate: desde, endDate: hasta }], ...cuerpo }),
  });
  const datos = await r.json();
  if (!r.ok) {
    console.error(`La API respondió ${r.status}: ${datos.error?.message ?? JSON.stringify(datos)}`);
    if (r.status === 403) {
      console.error(
        '\nUn 403 aquí es uno de tres permisos: la API sin habilitar, la API de\n' +
        'administración sin habilitar, o la cuenta de servicio sin dar de alta\n' +
        'como Lector de la propiedad. Empieza por «propiedades».'
      );
    }
    process.exit(1);
  }
  guardar(datos);
  return (datos.rows ?? []).map((f) => ({
    dim: f.dimensionValues.map((v) => v.value),
    met: f.metricValues.map((v) => Number(v.value)),
  }));
}

/** Filtro por una o varias fuentes de sesión. */
const porFuente = (fuentes) => ({
  dimensionFilter:
    fuentes.length === 1
      ? { filter: { fieldName: 'sessionSource', stringFilter: { value: fuentes[0] } } }
      : { filter: { fieldName: 'sessionSource', inListFilter: { values: fuentes } } },
});

function tabla(filas, columnas) {
  if (!filas.length) return console.log('  (sin datos en el periodo)');
  const anchos = columnas.map((c, i) =>
    Math.max(c.titulo.length, ...filas.map((f) => String(f[i]).length))
  );
  const linea = (celdas) =>
    celdas
      .map((c, i) => (columnas[i].derecha ? String(c).padStart(anchos[i]) : String(c).padEnd(anchos[i])))
      .join('  ');
  console.log(linea(columnas.map((c) => c.titulo)));
  console.log(anchos.map((a) => '─'.repeat(a)).join('  '));
  for (const f of filas) console.log(linea(f));
}

function guardar(datos) {
  if (!rutaJson) return;
  writeFileSync(rutaJson, JSON.stringify(datos, null, 2));
  console.log(`\nRespuesta cruda guardada en ${rutaJson}`);
}

/**
 * Conversión por sesión, en porcentaje.
 *
 * Se calcula sobre SESIONES y no sobre usuarios a propósito: un canal con
 * muchas sesiones por usuario —el tráfico directo del sitio tiene más de
 * seis— inflaría la cifra por usuario sin que haya llegado nadie nuevo.
 */
const tasa = (conv, sesiones) => (sesiones ? `${((conv / sesiones) * 100).toFixed(1)}%` : '—');

// --- Comandos ---------------------------------------------------------------

const comandos = {
  async propiedades() {
    const r = await fetch(`${ADMIN}/accountSummaries`, { headers: { authorization: await autorizacion() } });
    const datos = await r.json();
    if (!r.ok) {
      console.error(`La API de administración respondió ${r.status}: ${datos.error?.message}`);
      process.exit(1);
    }
    const cuentas = datos.accountSummaries ?? [];
    if (!cuentas.length) {
      console.log(
        'La API responde, pero la cuenta de servicio no ve ninguna propiedad.\n\n' +
        'Falta darla de alta en GA4 → Administrar → Accesos a la propiedad, con\n' +
        'rol Lector. Habilitar la API no concede acceso a los datos: son dos\n' +
        'permisos distintos.'
      );
      return;
    }
    for (const c of cuentas) {
      console.log(`${c.displayName} (${c.account})`);
      for (const p of c.propertySummaries ?? []) {
        console.log(`  ${p.displayName.padEnd(24)} ${p.property.replace('properties/', '')}`);
      }
    }
  },

  async canales() {
    const filas = await informe({
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'keyEvents' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: Number(opcion('limite', 30)),
    });
    console.log(`De dónde llega la gente — ${desde} a ${hasta}\n`);
    tabla(
      filas.map((f) => [
        `${f.dim[0]} / ${f.dim[1]}`,
        f.met[0], f.met[1], f.met[2], tasa(f.met[2], f.met[0]),
      ]),
      [
        { titulo: 'FUENTE / MEDIO' },
        { titulo: 'SESIONES', derecha: true },
        { titulo: 'USUARIOS', derecha: true },
        { titulo: 'CONV.', derecha: true },
        { titulo: 'TASA', derecha: true },
      ]
    );
    console.log(
      '\nLA TASA SE LEE CON CUIDADO. «conv.» son eventos clave, y aquí incluyen\n' +
      'clics a WhatsApp y a teléfono, que son intenciones de contacto, no ventas.\n' +
      'Un canal de ocho sesiones con dos clics no es un 25% de cierre.'
    );
  },

  async asistentes() {
    const filas = await informe({
      ...porFuente(ASISTENTES),
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'keyEvents' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });
    console.log(`Asistentes de IA — ${desde} a ${hasta}\n`);
    tabla(
      filas.map((f) => [`${f.dim[0]} / ${f.dim[1]}`, f.met[0], f.met[1], f.met[2]]),
      [
        { titulo: 'FUENTE / MEDIO' },
        { titulo: 'SESIONES', derecha: true },
        { titulo: 'USUARIOS', derecha: true },
        { titulo: 'CONV.', derecha: true },
      ]
    );
    console.log(
      '\nESTO ES EL SUELO, NO EL TOTAL. Solo cuenta a quien llegó por un enlace.\n' +
      'Cuando el asistente nombra la empresa y la persona escribe el dominio, la\n' +
      'visita entra como directa y no hay forma de distinguirla. Por eso sigue\n' +
      'haciendo falta preguntar «¿cómo nos encontró?».'
    );
  },

  async detalle() {
    const fuente = opcion('fuente', null);
    if (!fuente) {
      console.error('Falta --fuente. Ejemplo: node scripts/ga4.mjs detalle --fuente chatgpt.com');
      process.exit(1);
    }
    const filtro = porFuente([fuente]);
    console.log(`${fuente} — ${desde} a ${hasta}`);

    const bloque = async (titulo, dimension, metrica = 'sessions') => {
      const filas = await informe({
        ...filtro,
        dimensions: [{ name: dimension }],
        metrics: [{ name: metrica }],
        orderBys: [{ metric: { metricName: metrica }, desc: dimension !== 'date' }],
        limit: 25,
      });
      console.log(`\n${titulo}`);
      tabla(filas.map((f) => [f.dim[0], f.met[0]]), [
        { titulo: dimension.toUpperCase() },
        { titulo: metrica === 'sessions' ? 'SESIONES' : 'EVENTOS', derecha: true },
      ]);
    };

    await bloque('Por día', 'date');
    await bloque('Página de entrada', 'landingPage');
    await bloque('Ciudad', 'city');

    const eventos = await informe({
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: 'sessionSource', stringFilter: { value: fuente } } },
            { filter: { fieldName: 'isKeyEvent', stringFilter: { value: 'true' } } },
          ],
        },
      },
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
    });
    console.log('\nEventos clave');
    tabla(eventos.map((f) => [f.dim[0], f.met[0]]), [
      { titulo: 'EVENTO' },
      { titulo: 'VECES', derecha: true },
    ]);
  },

  async eventos() {
    const filas = await informe({
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: Number(opcion('limite', 25)),
    });
    console.log(`Eventos — ${desde} a ${hasta}\n`);
    tabla(filas.map((f) => [f.dim[0], f.met[0], f.met[1]]), [
      { titulo: 'EVENTO' },
      { titulo: 'VECES', derecha: true },
      { titulo: 'USUARIOS', derecha: true },
    ]);
  },
};

// --- Entrada ----------------------------------------------------------------

if (!comando || !comandos[comando]) {
  console.error(
    `Uso: node scripts/ga4.mjs <comando> [opciones]\n\n` +
    `Comandos: ${Object.keys(comandos).join(', ')}\n\n` +
    `Empieza por «propiedades»: confirma que los tres permisos están puestos y\n` +
    `te dice el identificador de la propiedad para el resto de comandos.`
  );
  process.exit(1);
}

await comandos[comando]();
