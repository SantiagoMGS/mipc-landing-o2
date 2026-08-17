import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * El sitio se escribe en español de Colombia.
 *
 * No es purismo: es que un cliente de Medellín nota inmediatamente cuando un
 * proveedor local escribe como si fuera de otro país, y lo lee como texto
 * copiado. Que es exactamente lo que era — la política de `/garantias/` es una
 * adaptación de un texto mexicano, y de esa migración quedaron giros ajenos
 * repartidos por el sitio.
 *
 * «Nave industrial» se corrigió el 2026-08-16 en el contenido Markdown, y
 * SOBREVIVIÓ hasta el 2026-08-17 en los pies y los `alt` de las fotos, que
 * viven en `src/data/*.ts` y nadie volvió a mirar. Lo encontró el cliente en su
 * propio celular, leyendo la página de soporte TI. En Colombia eso es una
 * bodega o una planta.
 *
 * Por eso este test recorre TODO `src/`, no solo el contenido: el texto visible
 * del sitio está repartido entre Markdown, componentes .astro y los archivos de
 * datos de imágenes.
 */
const PROHIBIDOS: Array<{ patron: RegExp; enColombia: string }> = [
  { patron: /\bnave(s)? industrial(es)?\b/i, enColombia: 'bodega o planta industrial' },
  { patron: /\bordenador(es)?\b/i, enColombia: 'computador' },
  { patron: /\bfichero(s)?\b/i, enColombia: 'archivo' },
  { patron: /\bvosotros\b|\bvuestr[oa]s?\b/i, enColombia: 'ustedes / su' },
  { patron: /\baparcamiento(s)?\b/i, enColombia: 'parqueadero' },
  { patron: /\bmovil(es)?\b(?!\s*(?:de\s*)?(?:orientable|dirigible))/i, enColombia: 'celular' },
  { patron: /\bgrifo(s)?\b/i, enColombia: 'llave' },
  { patron: /\bzumo(s)?\b/i, enColombia: 'jugo' },
  { patron: /\bchaval(es)?\b/i, enColombia: '—' },
  { patron: /\bdías naturales\b/i, enColombia: 'días calendario o hábiles' },
];

/**
 * Excepciones, con motivo. Cada una tiene que ser una decisión, no un olvido.
 *
 * `garantias.md` usa «días naturales» cinco veces, y **no se corrige aquí a
 * propósito**. No es un descuido de estilo: es el punto 7 de
 * `docs/revision-legal-garantias.md`. Ese articulado es una adaptación de una
 * política mexicana, y cambiar «naturales» por «calendario» o por «hábiles»
 * altera el cómputo real de un plazo de garantía — o sea, una obligación legal
 * de la empresa. Lo decide un abogado, no un test de redacción.
 *
 * Cuando esa revisión se resuelva, esta excepción se borra y el término se
 * corrige con el criterio que el abogado indique.
 */
const EXENTOS: Array<{ archivo: string; termino: RegExp; motivo: string }> = [
  {
    archivo: 'garantias.md',
    termino: /días naturales/i,
    motivo: 'punto 7 de docs/revision-legal-garantias.md — cambiarlo altera un plazo legal',
  },
];

/** Recorre src/ salvo binarios y hojas de estilo. */
function archivosDeTexto(dir: string): string[] {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return archivosDeTexto(ruta);
    return /\.(md|astro|ts)$/.test(entrada) ? [ruta] : [];
  });
}

describe('español de Colombia', () => {
  const archivos = archivosDeTexto('src');

  it('recorre todo el texto del sitio, no solo el contenido', () => {
    // Si este número baja de golpe, alguien movió el texto a un sitio que este
    // test no mira — que es exactamente cómo «nave industrial» sobrevivió a su
    // primera corrección.
    expect(archivos.length).toBeGreaterThan(40);
    expect(archivos.some((f) => f.includes('fotos-servicios'))).toBe(true);
    expect(archivos.some((f) => f.includes('content'))).toBe(true);
  });

  it('no usa giros de otros países hispanohablantes', () => {
    const fallos: string[] = [];

    for (const ruta of archivos) {
      // Este propio archivo lista los términos prohibidos: si se revisara a sí
      // mismo, fallaría siempre.
      if (ruta.includes('espanol-colombia')) continue;

      const lineas = readFileSync(ruta, 'utf-8').split(/\r?\n/);
      lineas.forEach((linea, i) => {
        for (const { patron, enColombia } of PROHIBIDOS) {
          const m = patron.exec(linea);
          if (!m) continue;
          const exento = EXENTOS.some(
            (e) => ruta.includes(e.archivo) && e.termino.test(m[0])
          );
          if (exento) continue;
          fallos.push(`${ruta}:${i + 1} «${m[0]}» → en Colombia: ${enColombia}`);
        }
      });
    }

    expect(fallos, `\n${fallos.join('\n')}\n`).toEqual([]);
  });
  it('las excepciones siguen siendo necesarias, no residuos', () => {
    // Una excepción que ya no encuentra nada es una excepción que sobra, y las
    // excepciones que sobran son las que después tapan un fallo real. Si
    // `garantias.md` deja de decir «días naturales» —porque la revisión legal
    // se resolvió— este test avisa de que hay que borrar la exención.
    for (const { archivo, termino, motivo } of EXENTOS) {
      const ruta = archivos.find((f) => f.includes(archivo));
      expect(ruta, `la exención apunta a ${archivo}, que ya no existe`).toBeDefined();
      expect(
        termino.test(readFileSync(ruta!, 'utf-8')),
        `${archivo} ya no contiene el término exento. Borra la exención (${motivo}).`
      ).toBe(true);
    }
  });
});
