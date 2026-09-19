/**
 * Cliente de la API de Google Search Console, sin dependencias.
 *
 * POR QUÉ SIN DEPENDENCIAS: `googleapis` pesa decenas de megas y acabaría en
 * el `package.json` del sitio, de modo que CI la instalaría en cada push para
 * un script que CI no ejecuta. El flujo que hace falta —firmar un JWT de
 * cuenta de servicio, canjearlo por un token y llamar a un REST— cabe en
 * `node:crypto` y `fetch`, que ya vienen en Node 22. Es la misma línea de
 * `check-dns.mjs` y `check-redirecciones.mjs`.
 *
 * CREDENCIALES: JSON de una cuenta de servicio, FUERA del repositorio. Se
 * busca en $GSC_CREDENCIALES y, si no está, en ~/.config/mipc/gsc.json.
 * Nunca en el árbol de trabajo: un JSON con una clave privada dentro del repo
 * es un `git add .` de distancia de acabar publicado en GitHub.
 *
 * La cuenta de servicio necesita permiso de lectura sobre la propiedad,
 * concedido desde Search Console → Configuración → Usuarios y permisos.
 * Habilitar la API en Google Cloud no basta: son dos permisos distintos y el
 * error que devuelve el segundo cuando falta (403) no dice cuál de los dos es.
 *
 * Uso:
 *   node scripts/gsc.mjs propiedades
 *   node scripts/gsc.mjs resumen     [--desde AAAA-MM-DD] [--hasta AAAA-MM-DD]
 *   node scripts/gsc.mjs consultas   [--limite 50]
 *   node scripts/gsc.mjs paginas
 *   node scripts/gsc.mjs municipios
 *   node scripts/gsc.mjs indexacion  [--limite 40]
 *
 * Opciones comunes:
 *   --propiedad <url>   por defecto sc-domain:mipc.com.co
 *   --json <ruta>       guarda la respuesta cruda, para comparar dentro de un mes
 */

import { createSign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ALCANCE = 'https://www.googleapis.com/auth/webmasters.readonly';
const BASE = 'https://www.googleapis.com/webmasters/v3';
const INSPECCION = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

/**
 * Fecha del corte de dominio. Es la frontera que separa los datos del
 * WordPress viejo de los del sitio nuevo, y por tanto el eje de toda
 * comparación que se haga aquí. Ver docs/despliegue-corte-dominio.md.
 */
const CORTE = '2026-08-16';

/**
 * Días que se descuentan al pedir el final del periodo.
 *
 * Search Console consolida con retraso: los últimos dos o tres días vienen
 * incompletos o vacíos. Pedirlos no da error —da cifras bajas—, que es peor,
 * porque una caída de tráfico inventada es indistinguible de una real hasta
 * que alguien se acuerda del retraso.
 */
const RETRASO_DIAS = 3;

// --- Argumentos -------------------------------------------------------------

const [, , comando, ...resto] = process.argv;

function opcion(nombre, porDefecto) {
  const i = resto.indexOf(`--${nombre}`);
  return i >= 0 && resto[i + 1] ? resto[i + 1] : porDefecto;
}

const propiedad = opcion('propiedad', 'sc-domain:mipc.com.co');
const rutaJson = opcion('json', null);

// --- Fechas -----------------------------------------------------------------

const iso = (d) => d.toISOString().slice(0, 10);
const masDias = (fecha, n) => {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const diasEntre = (a, b) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

const hoy = iso(new Date());
const hasta = opcion('hasta', masDias(hoy, -RETRASO_DIAS));
const desde = opcion('desde', CORTE);

/** Periodo anterior de la MISMA duración, terminando la víspera del corte. */
function periodoPrevio(desde, hasta) {
  const dias = diasEntre(desde, hasta);
  const finPrevio = masDias(desde, -1);
  return { desde: masDias(finPrevio, -dias), hasta: finPrevio };
}

// --- Autenticación ----------------------------------------------------------

function credenciales() {
  const ruta =
    process.env.GSC_CREDENCIALES ?? join(homedir(), '.config', 'mipc', 'gsc.json');
  try {
    const json = JSON.parse(readFileSync(ruta, 'utf-8'));
    if (!json.client_email || !json.private_key) {
      throw new Error('al JSON le faltan client_email o private_key');
    }
    return json;
  } catch (e) {
    console.error(
      `No se pudieron leer las credenciales en ${ruta}: ${e.message}\n\n` +
      'Se espera el JSON de una cuenta de servicio con acceso de lectura a la\n' +
      'propiedad. Ponlo fuera del repositorio y apunta $GSC_CREDENCIALES a él.'
    );
    process.exit(1);
  }
}

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Firma un JWT RS256 y lo canjea por un token de acceso. */
async function token() {
  const { client_email, private_key } = credenciales();
  const ahora = Math.floor(Date.now() / 1000);

  const cabecera = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = b64url(
    JSON.stringify({
      iss: client_email,
      scope: ALCANCE,
      aud: TOKEN_URL,
      iat: ahora,
      exp: ahora + 3600,
    })
  );
  const firma = b64url(
    createSign('RSA-SHA256').update(`${cabecera}.${cuerpo}`).sign(private_key)
  );

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
      'clave revocada. Si dice «invalid_scope», la API de Search Console no está\n' +
      'habilitada en el proyecto de Google Cloud.'
    );
    process.exit(1);
  }
  return datos.access_token;
}

async function api(url, opciones = {}) {
  const t = await token();
  const r = await fetch(url, {
    ...opciones,
    headers: {
      authorization: `Bearer ${t}`,
      'content-type': 'application/json',
      ...(opciones.headers ?? {}),
    },
  });
  const datos = await r.json();
  if (!r.ok) {
    const msg = datos.error?.message ?? r.statusText;
    console.error(`La API respondió ${r.status}: ${msg}`);
    if (r.status === 403) {
      console.error(
        '\n403 casi siempre significa que la cuenta de servicio no figura como\n' +
        'usuario de la propiedad. Search Console → Configuración → Usuarios y\n' +
        'permisos → Agregar usuario, con el client_email del JSON. Permiso\n' +
        '«Restringido» basta para leer.'
      );
    }
    process.exit(1);
  }
  return datos;
}

const consultar = (cuerpo) =>
  api(`${BASE}/sites/${encodeURIComponent(propiedad)}/searchAnalytics/query`, {
    method: 'POST',
    body: JSON.stringify({ dataState: 'final', ...cuerpo }),
  });

// --- Presentación -----------------------------------------------------------

const num = (n) => Math.round(n).toLocaleString('es-CO');
const pct = (n) => `${(n * 100).toFixed(1)}%`;

/** Variación relativa, con el signo delante y «—» si la base es cero. */
function variacion(antes, despues) {
  if (!antes) return despues ? 'nuevo' : '—';
  const v = (despues - antes) / antes;
  return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%`;
}

function tabla(filas, columnas) {
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

const totales = (filas) =>
  filas.reduce(
    (a, f) => ({
      clics: a.clics + f.clicks,
      impresiones: a.impresiones + f.impressions,
    }),
    { clics: 0, impresiones: 0 }
  );

function guardar(datos) {
  if (!rutaJson) return;
  writeFileSync(rutaJson, JSON.stringify(datos, null, 2));
  console.log(`\nRespuesta cruda guardada en ${rutaJson}`);
}

// --- Comandos ---------------------------------------------------------------

const comandos = {
  /** Confirma que las credenciales sirven y con qué nombre exacto llamar a la propiedad. */
  async propiedades() {
    const { siteEntry = [] } = await api(`${BASE}/sites`);
    if (!siteEntry.length) {
      console.log(
        'Las credenciales funcionan, pero la cuenta de servicio no tiene acceso a\n' +
        'ninguna propiedad. Falta agregarla como usuario en Search Console.'
      );
      return;
    }
    tabla(
      siteEntry.map((s) => [s.siteUrl, s.permissionLevel]),
      [{ titulo: 'PROPIEDAD' }, { titulo: 'PERMISO' }]
    );
    guardar(siteEntry);
  },

  /**
   * La comparación que importa: el sitio nuevo contra el WordPress al que
   * reemplazó, en dos ventanas de la misma duración.
   *
   * Es la señal de fallo nº 1 del diagnóstico: si las impresiones cayeron, la
   * migración perdió señal y hay que revisar los 301 antes que ninguna otra
   * cosa.
   */
  async resumen() {
    const previo = periodoPrevio(desde, hasta);
    const dias = diasEntre(desde, hasta) + 1;

    const [ahora, antes] = await Promise.all([
      consultar({ startDate: desde, endDate: hasta }),
      consultar({ startDate: previo.desde, endDate: previo.hasta }),
    ]);

    const a = ahora.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const b = antes.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };

    // ¿Existía la propiedad durante todo el periodo de comparación?
    //
    // Search Console NO rellena hacia atrás: los días anteriores a la
    // creación de una propiedad no vienen vacíos, vienen ausentes. Si no se
    // comprueba, el «antes» sale diminuto y la variación resultante es un
    // artefacto de la herramienta presentado como un éxito del sitio. Aquí
    // pasó exactamente eso: la propiedad de dominio empezó a recoger datos el
    // 2026-08-13 y la primera lectura de este comando anunció un +22.876%.
    const serie = await consultar({
      startDate: previo.desde,
      endDate: previo.hasta,
      dimensions: ['date'],
      rowLimit: 500,
    });
    const diasConDatos = serie.rows?.length ?? 0;
    const primero = serie.rows?.[0]?.keys[0];
    const incompleto = diasConDatos < dias;

    console.log(`Propiedad: ${propiedad}`);
    console.log(`Sitio nuevo : ${desde} → ${hasta}  (${dias} días, desde el corte)`);
    console.log(`WordPress   : ${previo.desde} → ${previo.hasta}  (${dias} días)\n`);

    tabla(
      [
        ['Impresiones', num(b.impressions), num(a.impressions), variacion(b.impressions, a.impressions)],
        ['Clics', num(b.clicks), num(a.clicks), variacion(b.clicks, a.clicks)],
        ['CTR', pct(b.ctr), pct(a.ctr), variacion(b.ctr, a.ctr)],
        // La posición mejora cuando BAJA, así que el signo se invierte a
        // propósito: un −12% aquí es una mejora de doce puntos porcentuales.
        ['Posición media', b.position.toFixed(1), a.position.toFixed(1), variacion(b.position, a.position)],
      ],
      [
        { titulo: 'MÉTRICA' },
        { titulo: 'ANTES', derecha: true },
        { titulo: 'DESPUÉS', derecha: true },
        { titulo: 'VAR.', derecha: true },
      ]
    );

    console.log(
      '\nEn «Posición media» un porcentaje negativo es una MEJORA: la posición\n' +
      'cuenta hacia abajo. En las otras tres filas, negativo es peor.'
    );

    if (incompleto) {
      console.log(
        `\n⚠️  LA COLUMNA «ANTES» NO ES COMPARABLE.\n\n` +
        `El periodo de comparación abarca ${dias} días, pero la propiedad solo\n` +
        `tiene datos de ${diasConDatos}${primero ? ` (desde el ${primero})` : ''}. Search Console no rellena\n` +
        `hacia atrás los días anteriores a la creación de una propiedad, así que\n` +
        `la variación de arriba mide sobre todo la edad de la propiedad, no el\n` +
        `rendimiento del sitio. Usa «dias» para ver la serie real.`
      );
    }
    guardar({ ahora, antes });
  },

  /**
   * Serie diaria, para saber desde cuándo hay datos de verdad.
   *
   * Es la primera comprobación que hay que hacer antes de creerse cualquier
   * comparación «antes / después»: Search Console NO rellena hacia atrás los
   * datos anteriores a la creación de una propiedad. Si la propiedad de
   * dominio se creó cerca del corte, el periodo «antes» sale casi vacío y la
   * mejora aparente es un artefacto de la herramienta, no del sitio.
   */
  async dias() {
    const desdeLargo = opcion('desde', masDias(CORTE, -120));
    const datos = await consultar({
      startDate: desdeLargo,
      endDate: hasta,
      dimensions: ['date'],
      rowLimit: 500,
    });
    const filas = datos.rows ?? [];
    if (!filas.length) {
      console.log('Sin datos en el periodo pedido.');
      return;
    }

    console.log(`Serie diaria ${desdeLargo} → ${hasta}`);
    console.log(`Primer día CON datos: ${filas[0].keys[0]}`);
    console.log(`Días con datos: ${filas.length} de ${diasEntre(desdeLargo, hasta) + 1} posibles\n`);

    const max = Math.max(...filas.map((f) => f.impressions));
    for (const f of filas) {
      const fecha = f.keys[0];
      const barra = '█'.repeat(Math.max(1, Math.round((f.impressions / max) * 40)));
      const marca = fecha === CORTE ? '  ← CORTE' : '';
      console.log(
        `${fecha}  ${String(num(f.impressions)).padStart(6)} impr  ${String(num(f.clicks)).padStart(3)} clics  ${barra}${marca}`
      );
    }
    guardar(datos);
  },

  async consultas() {
    const limite = Number(opcion('limite', 40));
    const datos = await consultar({
      startDate: desde,
      endDate: hasta,
      dimensions: ['query'],
      rowLimit: Math.max(limite, 200),
    });
    // Ordenar por IMPRESIONES, no por clics.
    //
    // La API ordena por clics descendente, y en un sitio joven casi todas las
    // filas tienen cero clics: el desempate queda alfabético. Con el orden de
    // fábrica, «computer repair» —10.486 impresiones y ningún clic— aparecía
    // por debajo de consultas de dos impresiones, y solo entró en la lista de
    // las quince primeras porque la «c» cae pronto en el alfabeto. Una
    // consulta que se lleva el 40% de las impresiones del sitio no puede
    // depender de su inicial para ser vista.
    const filas = (datos.rows ?? []).slice().sort((a, b) => b.impressions - a.impressions);
    const t = totales(filas);

    console.log(`Consultas ${desde} → ${hasta} — ${filas.length} con datos, por impresiones\n`);
    tabla(
      filas.slice(0, limite).map((f) => [
        f.keys[0],
        num(f.clicks),
        num(f.impressions),
        pct(f.ctr),
        f.position.toFixed(1),
      ]),
      [
        { titulo: 'CONSULTA' },
        { titulo: 'CLICS', derecha: true },
        { titulo: 'IMPR.', derecha: true },
        { titulo: 'CTR', derecha: true },
        { titulo: 'POS.', derecha: true },
      ]
    );
    console.log(`\nTotal: ${num(t.clics)} clics, ${num(t.impresiones)} impresiones`);
    guardar(datos);
  },

  /**
   * Desglose de UNA consulta por país y por página de destino.
   *
   * Sirve para decidir si un volumen grande de impresiones es demanda real o
   * ruido. Una consulta con muchas impresiones y ningún clic no dice por sí
   * sola cuál de las dos cosas es: el país y la página que la recibe sí.
   */
  async detalle() {
    const filtro = opcion('consulta', null);
    if (!filtro) {
      console.error('Falta --consulta "<texto exacto>"');
      process.exit(1);
    }
    const comun = {
      startDate: desde,
      endDate: hasta,
      rowLimit: 100,
      dimensionFilterGroups: [
        { filters: [{ dimension: 'query', operator: 'equals', expression: filtro }] },
      ],
    };
    const [pais, pagina] = await Promise.all([
      consultar({ ...comun, dimensions: ['country'] }),
      consultar({ ...comun, dimensions: ['page'] }),
    ]);

    console.log(`«${filtro}»  ${desde} → ${hasta}\n`);
    const orden = (d) => (d.rows ?? []).slice().sort((a, b) => b.impressions - a.impressions);

    console.log('Por país:');
    tabla(
      orden(pais).slice(0, 10).map((f) => [f.keys[0], num(f.clicks), num(f.impressions), f.position.toFixed(1)]),
      [{ titulo: 'PAÍS' }, { titulo: 'CLICS', derecha: true }, { titulo: 'IMPR.', derecha: true }, { titulo: 'POS.', derecha: true }]
    );

    console.log('\nPor página:');
    tabla(
      orden(pagina).slice(0, 10).map((f) => [new URL(f.keys[0]).pathname, num(f.clicks), num(f.impressions), f.position.toFixed(1)]),
      [{ titulo: 'RUTA' }, { titulo: 'CLICS', derecha: true }, { titulo: 'IMPR.', derecha: true }, { titulo: 'POS.', derecha: true }]
    );
    guardar({ pais, pagina });
  },

  async paginas() {
    const datos = await consultar({
      startDate: desde,
      endDate: hasta,
      dimensions: ['page'],
      rowLimit: 500,
    });
    const filas = datos.rows ?? [];

    // Agrupar por sección dice más que la lista plana: la pregunta del
    // diagnóstico es si los servicios rinden y si el blog trabaja para algo.
    const seccion = (url) => {
      const p = new URL(url).pathname;
      const m = p.match(/^\/(servicios|proyectos|blog)\//);
      return m ? m[1] : p === '/' ? 'portada' : 'otras';
    };
    const grupos = new Map();
    for (const f of filas) {
      const s = seccion(f.keys[0]);
      const g = grupos.get(s) ?? { clics: 0, impresiones: 0, paginas: 0 };
      g.clics += f.clicks;
      g.impresiones += f.impressions;
      g.paginas += 1;
      grupos.set(s, g);
    }

    console.log(`Páginas ${desde} → ${hasta} — ${filas.length} con datos\n`);
    tabla(
      [...grupos.entries()]
        .sort((a, b) => b[1].impresiones - a[1].impresiones)
        .map(([s, g]) => [s, num(g.paginas), num(g.clics), num(g.impresiones)]),
      [
        { titulo: 'SECCIÓN' },
        { titulo: 'PÁGS.', derecha: true },
        { titulo: 'CLICS', derecha: true },
        { titulo: 'IMPR.', derecha: true },
      ]
    );

    console.log('\nDetalle, 25 primeras por impresiones:\n');
    tabla(
      filas.slice().sort((a, b) => b.impressions - a.impressions).slice(0, 25).map((f) => [
        new URL(f.keys[0]).pathname,
        num(f.clicks),
        num(f.impressions),
        f.position.toFixed(1),
      ]),
      [
        { titulo: 'RUTA' },
        { titulo: 'CLICS', derecha: true },
        { titulo: 'IMPR.', derecha: true },
        { titulo: 'POS.', derecha: true },
      ]
    );
    guardar(datos);
  },

  /**
   * Demanda real por municipio.
   *
   * Decide si valen la pena las cinco páginas por municipio de la Prioridad
   * 3.4 del diagnóstico. Si un municipio no aparece en ninguna consulta, esa
   * página se escribiría a ciegas — y el propio diagnóstico advierte que una
   * plantilla con el nombre cambiado es contenido delgado.
   */
  async municipios() {
    const ZONA = ['medellín', 'medellin', 'envigado', 'sabaneta', 'itagüí', 'itagui', 'bello', 'la estrella'];
    const datos = await consultar({
      startDate: desde,
      endDate: hasta,
      dimensions: ['query'],
      rowLimit: 5000,
    });
    const filas = datos.rows ?? [];

    const porMunicipio = new Map(ZONA.map((m) => [m, { clics: 0, impresiones: 0, consultas: [] }]));
    for (const f of filas) {
      const q = f.keys[0].toLowerCase();
      for (const m of ZONA) {
        if (!q.includes(m)) continue;
        const g = porMunicipio.get(m);
        g.clics += f.clicks;
        g.impresiones += f.impressions;
        g.consultas.push(f);
      }
    }

    // «medellin» e «itagui» sin tilde son la misma demanda que con ella.
    const unir = (a, b) => {
      const x = porMunicipio.get(a);
      const y = porMunicipio.get(b);
      x.clics += y.clics;
      x.impresiones += y.impresiones;
      x.consultas.push(...y.consultas);
      porMunicipio.delete(b);
    };
    unir('medellín', 'medellin');
    unir('itagüí', 'itagui');

    console.log(`Consultas con nombre de municipio, ${desde} → ${hasta}\n`);
    tabla(
      [...porMunicipio.entries()]
        .sort((a, b) => b[1].impresiones - a[1].impresiones)
        .map(([m, g]) => [m, num(g.consultas.length), num(g.clics), num(g.impresiones)]),
      [
        { titulo: 'MUNICIPIO' },
        { titulo: 'CONSULTAS', derecha: true },
        { titulo: 'CLICS', derecha: true },
        { titulo: 'IMPR.', derecha: true },
      ]
    );

    for (const [m, g] of porMunicipio) {
      if (m === 'medellín' || !g.consultas.length) continue;
      console.log(`\n${m} — las consultas reales:`);
      for (const f of g.consultas.sort((a, b) => b.impressions - a.impressions).slice(0, 10)) {
        console.log(`  ${String(num(f.impressions)).padStart(6)} impr.  ${f.keys[0]}`);
      }
    }
    guardar(datos);
  },

  /**
   * Estado de indexación, URL por URL.
   *
   * El informe de cobertura no se expone por API: solo existe la inspección
   * individual. Se leen las URL del sitemap publicado y se pregunta por cada
   * una, que para un sitio de 36 páginas es perfectamente viable.
   */
  async indexacion() {
    const limite = Number(opcion('limite', 40));
    const sitio = propiedad.startsWith('sc-domain:')
      ? `https://${propiedad.slice('sc-domain:'.length)}`
      : propiedad.replace(/\/$/, '');

    const xml = await (await fetch(`${sitio}/sitemap-0.xml`)).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).slice(0, limite);
    console.log(`Inspeccionando ${urls.length} URL del sitemap. Tarda un momento.\n`);

    const filas = [];
    for (const url of urls) {
      const r = await api(INSPECCION, {
        method: 'POST',
        body: JSON.stringify({ inspectionUrl: url, siteUrl: propiedad }),
      });
      const i = r.inspectionResult?.indexStatusResult ?? {};
      filas.push([
        new URL(url).pathname,
        i.verdict ?? '?',
        i.coverageState ?? '?',
        i.lastCrawlTime ? i.lastCrawlTime.slice(0, 10) : '—',
      ]);
    }

    tabla(filas, [
      { titulo: 'RUTA' },
      { titulo: 'VEREDICTO' },
      { titulo: 'ESTADO' },
      { titulo: 'ÚLT. RASTREO' },
    ]);

    const fuera = filas.filter((f) => f[1] !== 'PASS');
    console.log(
      fuera.length
        ? `\n${fuera.length} URL sin indexar correctamente. Son las de arriba con veredicto distinto de PASS.`
        : `\nLas ${filas.length} URL inspeccionadas están indexadas.`
    );
    guardar(filas);
  },
};

// --- Entrada ----------------------------------------------------------------

if (!comando || !comandos[comando]) {
  console.error(
    `Uso: node scripts/gsc.mjs <comando> [opciones]\n\n` +
    `Comandos: ${Object.keys(comandos).join(', ')}\n\n` +
    `Empieza por «propiedades»: confirma que las credenciales sirven y te dice\n` +
    `el nombre exacto de la propiedad para el resto de comandos.`
  );
  process.exit(1);
}

await comandos[comando]();
