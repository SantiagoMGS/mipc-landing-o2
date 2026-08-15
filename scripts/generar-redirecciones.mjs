// Genera public/_redirects (formato Cloudflare Pages) a partir del mapa
// único en src/data/redirecciones.ts. Se ejecuta como "prebuild" en cada
// build, así _redirects nunca puede quedar desactualizado respecto al mapa.
//
// Este script importa un archivo .ts directamente porque Node (>=22.6, sin
// flag desde 23.6) puede despojar anotaciones de tipos en tiempo de carga.
// Así evitamos duplicar el mapa de redirecciones en un segundo archivo:
// una sola fuente de verdad para los tests, el build y el verificador.
import { writeFileSync } from 'node:fs';
import { redirecciones } from '../src/data/redirecciones.ts';

const lineas = redirecciones.map((r) => `${r.de} ${r.a} 301`);
writeFileSync('public/_redirects', lineas.join('\n') + '\n');
console.log(`_redirects generado con ${lineas.length} reglas`);
