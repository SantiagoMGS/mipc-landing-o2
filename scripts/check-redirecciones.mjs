// Verificador post-corte: confirma, contra el dominio en vivo, que cada
// URL vieja de WordPress responde con 301 hacia su destino nuevo. Se corre
// a mano después de publicar el sitio nuevo, no como parte del build.
//
// Uso: node scripts/check-redirecciones.mjs [URL_BASE]
// Por defecto usa https://mipc.com.co
import { redirecciones, reglasDesplegadas } from '../src/data/redirecciones.ts';

// Se verifica lo DESPLEGADO, no el mapa escrito a mano. Son cosas distintas:
// el hook de astro.config.mjs añade a cada regla su variante sin barra final,
// y hasta el 2026-09-19 esas variantes no existían y daban 404 en producción
// sin que nada lo notara —este script las ignoraba porque leía el mapa—.
//
// El `ejemplo` de las reglas con comodín vive en el mapa, así que hay que
// traerlo desde ahí: la expansión solo lleva `de` y `a`.
const ejemplos = new Map(redirecciones.filter((r) => r.ejemplo).map((r) => [r.de, r.ejemplo]));
const aVerificar = reglasDesplegadas();

const base = process.argv[2] ?? 'https://mipc.com.co';
let fallos = 0;

for (const r of aVerificar) {
  // Las reglas con comodín se comprueban con una URL de ejemplo que el
  // comodín deba capturar. Pedir literalmente '/wp-content/uploads/*' no
  // prueba la regla: prueba una ruta con un asterisco que nadie visita.
  const ejemplo = ejemplos.get(r.de);
  const ruta = ejemplo ?? r.de;
  const res = await fetch(base + ruta, { redirect: 'manual' });
  const destino = res.headers.get('location') ?? '';
  // `endsWith(r.a)` hacía pasar cualquier destino que terminara en la misma
  // barra que r.a — la fila '/home/' -> '/' pasaba con CUALQUIER destino
  // terminado en '/', incluida una redirección rota a otra ruta. Comparar
  // el pathname real, resuelto contra la base, exige coincidencia exacta.
  const pathnameDestino = destino ? new URL(destino, base).pathname : '';
  const ok = res.status === 301 && pathnameDestino === r.a;
  if (!ok) {
    fallos++;
    const etiqueta = ejemplo ? `${r.de} (probada con ${ejemplo})` : r.de;
    console.error(`FALLA ${etiqueta} -> esperaba 301 a ${r.a}, obtuvo ${res.status} ${destino}`);
  }
}

console.log(fallos === 0
  ? `Las ${aVerificar.length} redirecciones desplegadas responden correctamente`
  : `${fallos} redirecciones fallan`);
process.exit(fallos === 0 ? 0 : 1);
