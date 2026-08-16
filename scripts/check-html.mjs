import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { parse } from 'node-html-parser';

const paginas = globSync('dist/**/*.html');

// Un verificador que no verificó nada NO puede reportar éxito: con dist/
// vacío o un build parcial, el bucle no se ejecuta, fallos queda en cero y
// el script imprime «sin problemas» y sale con 0. Para un sistema de CI que
// solo mira el código de salida, eso se lee como una compilación sana.
const MINIMO_PAGINAS = 14;
if (paginas.length < MINIMO_PAGINAS) {
  console.error(
    `Solo se encontraron ${paginas.length} páginas en dist/, y se esperaban al menos ` +
    `${MINIMO_PAGINAS}. El build está incompleto o la ruta cambió: no hay nada que verificar.`
  );
  process.exit(1);
}

const fallos = [];

for (const ruta of paginas) {
  const en = (msg) => fallos.push(`${ruta}: ${msg}`);
  let doc;
  try {
    doc = parse(readFileSync(ruta, 'utf-8'));
  } catch (e) {
    en(`no se pudo leer ni parsear: ${e.message}`);
    continue;
  }

  // SEO-01: una y solo una h1
  const h1 = doc.querySelectorAll('h1');
  if (h1.length !== 1) en(`tiene ${h1.length} etiquetas h1, debe tener exactamente 1`);

  // SEO-02: meta description presente y útil
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  if (desc.length < 70) en(`meta description ausente o demasiado corta (${desc.length} caracteres)`);
  if (desc.length > 165) en(`meta description demasiado larga (${desc.length} caracteres)`);

  // CRIT-05: idioma correcto
  const lang = doc.querySelector('html')?.getAttribute('lang');
  if (lang !== 'es-CO') en(`lang es "${lang}", debe ser "es-CO"`);

  // SEO-03: el title no puede terminar en el dominio
  const title = doc.querySelector('title')?.text ?? '';
  // Ausencia y error son defectos distintos: sin esta rama, una página sin
  // <title> falla con «no termina en la marca», que despista al que lo lea.
  if (!title) en('falta la etiqueta <title>');
  if (title.includes('mipc.com.co')) en('el title contiene el dominio en vez de la marca');
  if (!title.endsWith('| MiPC Tecnología')) en(`el title no termina en la marca: "${title}"`);
  // Las páginas que pasan `title` como prop no atraviesan el esquema Zod,
  // así que el límite de longitud solo existe aquí para ellas.
  if (title.length > 65) en(`title de ${title.length} caracteres, Google lo truncará: "${title}"`);

  // Nota para quien añada una imagen decorativa: el estándar pide alt="" en
  // ese caso, y esta regla lo rechazaría. La salida NO es relajar la regla,
  // sino añadir una excepción explícita (p. ej. un atributo data-decorativa)
  // para que la ausencia de alt siga siendo un fallo en todo lo demás.
  // SEO-07: alt en toda imagen
  for (const img of doc.querySelectorAll('img')) {
    const alt = img.getAttribute('alt');
    if (!alt || alt.trim().length < 5) en(`imagen sin alt útil: ${img.getAttribute('src')}`);
    if (alt && /\.(png|jpe?g|webp|svg)$/i.test(alt)) en(`el alt es el nombre del archivo: ${alt}`);
  }

  // Canonical absoluta. Se exige también en dist/404.html: es una página real
  // (el estado HTTP 404, no la etiqueta canonical, es lo que evita que se indexe),
  // y como pasa por el mismo componente SEO que el resto, no hay motivo para
  // darle un trato especial.
  const canon = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
  if (!canon.startsWith('https://mipc.com.co/')) en(`canonical ausente o relativa: "${canon}"`);

  // Favicon. El sitio se construyó entero sin uno: el navegador pedía
  // /favicon.ico, recibía la página 404 y la pestaña quedaba con el icono
  // genérico. No lo atrapó nada porque ninguna comprobación lo miraba —
  // ausencia de una etiqueta que nadie exige no rompe ningún test.
  if (!doc.querySelector('link[rel="icon"]')) en('sin <link rel="icon">: la pestaña queda sin favicon');
}

if (fallos.length) {
  console.error(`\n${fallos.length} problemas de calidad en el HTML:\n`);
  for (const f of fallos) console.error('  ' + f);
  process.exit(1);
}
console.log(`${paginas.length} páginas verificadas, sin problemas`);
