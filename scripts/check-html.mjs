import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { parse } from 'node-html-parser';

const paginas = globSync('dist/**/*.html');
const fallos = [];

for (const ruta of paginas) {
  const doc = parse(readFileSync(ruta, 'utf-8'));
  const en = (msg) => fallos.push(`${ruta}: ${msg}`);

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
  if (title.includes('mipc.com.co')) en('el title contiene el dominio en vez de la marca');
  if (!title.endsWith('| MiPC Tecnología')) en(`el title no termina en la marca: "${title}"`);
  // Las páginas que pasan `title` como prop no atraviesan el esquema Zod,
  // así que el límite de longitud solo existe aquí para ellas.
  if (title.length > 65) en(`title de ${title.length} caracteres, Google lo truncará: "${title}"`);

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
}

if (fallos.length) {
  console.error(`\n${fallos.length} problemas de calidad en el HTML:\n`);
  for (const f of fallos) console.error('  ' + f);
  process.exit(1);
}
console.log(`${paginas.length} páginas verificadas, sin problemas`);
