import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { esquemaServicio } from '../src/schemas';

describe('esquema de servicio', () => {
  const valido = {
    titulo: 'Soporte TI Empresarial',
    h1: 'Soporte TI empresarial en Medellín',
    metaTitle: 'Soporte TI Empresarial en Medellín | MiPC Tecnología',
    metaDescription: 'Mesa de ayuda, soporte remoto y en sitio para empresas en Medellín con más de 15 años de experiencia.',
    resumen: 'Mesa de ayuda y soporte para empresas.',
    publico: 'empresa',
    orden: 1,
  };

  it('acepta un servicio completo', () => {
    expect(() => esquemaServicio.parse(valido)).not.toThrow();
  });

  it('rechaza un servicio sin metaDescription', () => {
    const { metaDescription, ...sinMeta } = valido;
    expect(() => esquemaServicio.parse(sinMeta)).toThrow();
  });

  it('rechaza una metaDescription demasiado corta para ser útil', () => {
    expect(() => esquemaServicio.parse({ ...valido, metaDescription: 'Corta.' })).toThrow();
  });

  it('rechaza un metaTitle que termine en el dominio', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, metaTitle: 'Servicios – mipc.com.co' })
    ).toThrow();
  });

  it('rechaza una imagen sin alt', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, imagen: { src: './foto.jpg' } })
    ).toThrow();
  });

  it('rechaza un metaTitle que contiene el dominio aunque termine correctamente', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, metaTitle: 'Servicios de mipc.com.co en Medellín | MiPC Tecnología' })
    ).toThrow();
  });

  it('rechaza un alt que es un nombre de archivo largo', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, imagen: { src: './foto.jpg', alt: 'foto-tecnico-instalando-servidor.jpg' } })
    ).toThrow();
  });
});

describe('fotosPorServicio (src/data/fotos-servicios.ts)', () => {
  // No se importa el módulo directamente: sus imports de ../assets/fotos/*.jpg
  // dependen del pipeline de assets de Astro (ImageMetadata), que no está
  // disponible bajo vitest en Node puro. Se lee el archivo fuente como texto
  // y se extraen sus claves de nivel superior con una expresión regular —
  // suficiente para esta comprobación de sincronía de nombres.
  const fuente = readFileSync('src/data/fotos-servicios.ts', 'utf-8');
  const claves = [...fuente.matchAll(/^\s{2}'([\w-]+)':\s*\[/gm)].map((m) => m[1]);

  const idsReales = readdirSync('src/content/servicios')
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  it('encontró al menos una clave (si esto falla, la regex dejó de coincidir con el archivo)', () => {
    expect(claves.length).toBeGreaterThan(0);
  });

  it('cada clave coincide con un id real de la colección servicios', () => {
    // Un slug de servicio renombrado sin actualizar este mapa degrada en
    // silencio a "cero fotos" para esa página: fotosPorServicio[id] ?? []
    // no lanza ni avisa. Este test convierte ese renombrado en un fallo.
    for (const clave of claves) {
      expect(idsReales).toContain(clave);
    }
  });
});

/**
 * El sitio está en `es-CO` y lo lee gente de Medellín. Un término de España
 * hace dos daños a la vez: suena importado —lo que resta credibilidad justo
 * en las páginas que deben transmitir oficio— y no lo busca nadie aquí, así
 * que la palabra que se posiciona es la que no está escrita.
 *
 * Se detectó con «nave industrial», que estaba en dos proyectos. En uno de
 * ellos la propia página ya decía «planta industrial» en su meta description
 * y «la planta» en el cuerpo: el texto se contradecía consigo mismo y aun así
 * nada falló, porque ninguna comprobación miraba el vocabulario.
 *
 * La lista es corta a propósito. Solo entran términos que son inequívocamente
 * de España Y plausibles en este dominio. Se dejan fuera los ambiguos —«piso»
 * es correcto aquí para el suelo, «vale» es el verbo valer, «enchufe» se usa
 * en Colombia— porque un test con falsos positivos se acaba desactivando.
 */
describe('español de Colombia', () => {
  // OJO con los plurales: `industriales?` significa «industriale» más una «s»
  // opcional, y por tanto NUNCA coincide con «industrial». La primera versión
  // de esta lista tenía ese error en tres de los ocho patrones y el test pasó
  // igual, en verde, sin detectar el término que motivó escribirlo. Los
  // plurales de palabras terminadas en consonante van como `(es)?`.
  const PENINSULARES: Array<[RegExp, string]> = [
    [/\bnaves?\s+industrial(es)?\b/i, 'planta industrial / bodega'],
    [/\bordenador(es)?\b/i, 'computador'],
    [/\bcuadros?\s+eléctricos?\b/i, 'tablero eléctrico'],
    [/\bfontaner(o|a|ía)\b/i, 'plomero / plomería'],
    [/\baparca(r|miento|do)\b/i, 'parquear / parqueadero'],
    [/\bzumos?\b/i, 'jugo'],
    [/\bvosotros\b/i, 'ustedes'],
    [/\bmóvil(es)?\s+(nuevos?|del\s+cliente)\b/i, 'celular'],
  ];

  // El test de arriba solo demuestra que no hay hallazgos, que es justo lo que
  // un patrón roto también produce. Este comprueba que los patrones SÍ
  // coinciden con lo que dicen buscar: sin él, la lista puede degradar a
  // decorativa sin que nada lo señale.
  const EJEMPLOS = [
    'Una nave industrial no perdona improvisaciones',
    'dos naves industriales en el polígono',
    'el ordenador del cliente',
    'varios ordenadores de la oficina',
    'el cuadro eléctrico de la planta',
    'trabajo de fontanería',
    'el aparcamiento del centro',
    'un zumo de naranja',
    'vosotros decidís',
    'el móvil del cliente',
  ];

  const archivos = (function listar(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? listar(`${dir}/${e.name}`)
        : e.name.endsWith('.md')
          ? [`${dir}/${e.name}`]
          : []
    );
  })('src/content');

  it('encontró contenido que revisar (si esto falla, la ruta cambió)', () => {
    expect(archivos.length).toBeGreaterThan(15);
  });

  it('cada patrón coincide de verdad con el término que dice buscar', () => {
    for (const ejemplo of EJEMPLOS) {
      const coincide = PENINSULARES.some(([patron]) => patron.test(ejemplo));
      expect(coincide, `ningún patrón detecta: "${ejemplo}"`).toBe(true);
    }
  });

  it('no marca como españolismo el vocabulario correcto en Colombia', () => {
    // Un test con falsos positivos se acaba desactivando, así que estos casos
    // fijan lo que NO debe saltar: «piso» es el suelo, «vale» es el verbo
    // valer y «navegador» empieza por «nave».
    for (const bueno of [
      'sentado en el piso de la bodega',
      'el reconocimiento inmediato vale más',
      'bloquear la medición desde el navegador',
      'la planta industrial de Global',
    ]) {
      const falsoPositivo = PENINSULARES.find(([patron]) => patron.test(bueno));
      expect(falsoPositivo?.[1], `falso positivo en: "${bueno}"`).toBeUndefined();
    }
  });

  it('no usa términos de España en el contenido publicado', () => {
    const hallazgos: string[] = [];
    for (const ruta of archivos) {
      const texto = readFileSync(ruta, 'utf-8');
      for (const [patron, alternativa] of PENINSULARES) {
        const m = texto.match(patron);
        if (m) hallazgos.push(`${ruta}: "${m[0]}" → usar "${alternativa}"`);
      }
    }
    expect(hallazgos, `\n${hallazgos.join('\n')}\n`).toHaveLength(0);
  });
});

/**
 * Escalares de YAML sin comillas que contienen `: ` o ` #`.
 *
 * Dos fallos distintos, y el segundo es el que justifica este test.
 *
 * Un `: ` dentro de un escalar suelto —«la recogida es gratis: no está
 * condicionada»— rompe el análisis y el build falla. Es ruidoso, pero el error
 * de js-yaml solo da línea y columna DEL BLOQUE de frontmatter, sin nombrar el
 * archivo ni el campo, así que cuesta encontrarlo. El 2026-08-16 costó tres
 * intentos.
 *
 * Un ` #` precedido de espacio abre un comentario y **no falla**: se publica el
 * valor truncado. Ese mismo día, la dirección «Carrera 66A # 34-48, Interior
 * 101» de una respuesta de FAQ se habría publicado como «Carrera 66A», sin
 * error y sin que nada lo notara. En una ficha local eso es media dirección
 * contradiciendo a la de Google Business Profile, que es de las peores señales
 * que se pueden emitir.
 *
 * La corrección en los dos casos es la misma: comillas dobles.
 */
describe('frontmatter de todo el contenido', () => {
  const dirs = ['servicios', 'blog', 'proyectos', 'clientes', 'paginas'];

  const archivos = dirs.flatMap((d) =>
    readdirSync(`src/content/${d}`)
      .filter((f) => f.endsWith('.md'))
      .map((f) => `src/content/${d}/${f}`)
  );

  it('encuentra archivos que revisar', () => {
    expect(archivos.length).toBeGreaterThan(10);
  });

  it('no deja escalares sin comillas con «: » o « #» dentro', () => {
    const fallos: string[] = [];

    for (const ruta of archivos) {
      // `\r\n` → `\n` antes de partir. En Windows el árbol de trabajo está en
      // CRLF, y sin esto cada línea termina en `\r`: `indexOf('---')` no
      // encuentra el cierre del frontmatter, `fin` queda en -1 y el bucle se
      // salta TODOS los archivos. La primera versión de este test pasaba sin
      // mirar nada, que es la peor forma de fallar que tiene un test.
      const lineas = readFileSync(ruta, 'utf-8').replace(/\r\n/g, '\n').split('\n');
      const fin = lineas.indexOf('---', 1);
      expect(fin, `${ruta}: no se encontró el cierre del frontmatter`).toBeGreaterThan(0);

      lineas.slice(0, fin).forEach((linea, i) => {
        // `clave: valor` y también `- elemento` de una secuencia.
        const m = /^\s*-?\s*\w+:\s+(.*)$/.exec(linea) ?? /^\s*-\s+(?!\w+:)(.*)$/.exec(linea);
        const valor = m?.[1];
        if (!valor || /^["'|>]/.test(valor)) return;

        if (valor.includes(': ')) fallos.push(`${ruta}:${i + 1} «: » sin comillas — rompe el build: ${valor.slice(0, 60)}`);
        if (/\s#/.test(valor)) fallos.push(`${ruta}:${i + 1} « #» sin comillas — se publica TRUNCADO: ${valor.slice(0, 60)}`);
      });
    }

    expect(fallos, `\n${fallos.join('\n')}\n`).toEqual([]);
  });
});
