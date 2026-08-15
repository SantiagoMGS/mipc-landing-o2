// Verificador post-corte: confirma, contra el dominio en vivo, que cada
// URL vieja de WordPress responde con 301 hacia su destino nuevo. Se corre
// a mano después de publicar el sitio nuevo, no como parte del build.
//
// Uso: node scripts/check-redirecciones.mjs [URL_BASE]
// Por defecto usa https://mipc.com.co
import { redirecciones } from '../src/data/redirecciones.ts';

const base = process.argv[2] ?? 'https://mipc.com.co';
let fallos = 0;

for (const r of redirecciones) {
  const res = await fetch(base + r.de, { redirect: 'manual' });
  const destino = res.headers.get('location') ?? '';
  // `endsWith(r.a)` hacía pasar cualquier destino que terminara en la misma
  // barra que r.a — la fila '/home/' -> '/' pasaba con CUALQUIER destino
  // terminado en '/', incluida una redirección rota a otra ruta. Comparar
  // el pathname real, resuelto contra la base, exige coincidencia exacta.
  const pathnameDestino = destino ? new URL(destino, base).pathname : '';
  const ok = res.status === 301 && pathnameDestino === r.a;
  if (!ok) {
    fallos++;
    console.error(`FALLA ${r.de} -> esperaba 301 a ${r.a}, obtuvo ${res.status} ${destino}`);
  }
}

console.log(fallos === 0
  ? `Las ${redirecciones.length} redirecciones responden correctamente`
  : `${fallos} redirecciones fallan`);
process.exit(fallos === 0 ? 0 : 1);
