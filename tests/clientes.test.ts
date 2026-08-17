import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('muro de clientes', () => {
  const doc = parse(readFileSync('dist/index.html', 'utf-8'));

  it('muestra los 20 clientes', () => {
    expect(doc.querySelectorAll('[data-cliente]')).toHaveLength(20);
  });

  it('TODOS los logos se exhiben a 88px, no solo el primero', () => {
    const imgs = doc.querySelectorAll('[data-cliente] img');
    // Los 20 clientes tienen logo desde el 2026-08-16, cuando llegaron los
    // seis que faltaban. La rama de texto de MuroClientes.astro ya no la
    // ejercita ningún cliente, pero NO se quita: el día que entre uno sin
    // logotipo, la alternativa tiene que seguir siendo su nombre compuesto y
    // no un hueco en la cuadrícula.
    expect(imgs).toHaveLength(20);

    // El tamaño de exhibición lo fija la clase, no el atributo `width`. Desde
    // que los logos pasan por astro:assets, `width`/`height` llevan las
    // dimensiones INTRÍNSECAS del archivo —179x105— que es lo que reserva el
    // hueco con la proporción correcta y evita el salto de maquetación.
    // Comprobar aquí `width === '88'` era comprobar un detalle de
    // implementación, y habría bloqueado la optimización en vez de protegerla.
    expect(imgs.every((i) => i.getAttribute('class')?.includes('w-[88px]'))).toBe(true);
    expect(imgs.every((i) => i.getAttribute('width') && i.getAttribute('height'))).toBe(true);
  });

  it('los logos se sirven optimizados y con srcset, no crudos desde public/', () => {
    const imgs = doc.querySelectorAll('[data-cliente] img');
    // Hasta el 2026-08-16 eran veinte PNG servidos tal cual desde `public/`,
    // 248 KB en total y casi un tercio del peso de la portada. No pasaban por
    // el pipeline porque el campo `logo` era una cadena en el frontmatter, y
    // astro:assets necesita una importación. Ahora salen de
    // src/data/logos-clientes.ts, en WebP y con dos anchos.
    expect(imgs.every((i) => i.getAttribute('src')?.endsWith('.webp'))).toBe(true);
    expect(imgs.every((i) => i.getAttribute('srcset')?.includes('176w'))).toBe(true);
    expect(imgs.every((i) => i.getAttribute('src')?.startsWith('/logos/'))).toBe(false);
  });

  it('cada alt nombra a su cliente, no es texto de relleno', () => {
    // Comprobar solo la longitud dejaría pasar un alt genérico repetido.
    //
    // Antes esto se contrastaba contra el NOMBRE DEL ARCHIVO del logotipo, lo
    // que dejó de funcionar el 2026-08-16 al pasar los logos por astro:assets:
    // el archivo servido lleva el hash del contenido y extensión .webp. Se
    // contrasta ahora contra la fuente de verdad —el `nombre` de cada ficha—,
    // que además es lo que el test quería decir desde el principio.
    //
    // La comparación normaliza tildes y quita todo lo que no sea letra o
    // dígito, porque los nombres reales llevan acentos y siglas con puntos
    // («Olímpica Stereo», «E.I.P. S.A.S.») que un substring literal no casaría.
    const normalizar = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const nombres = readdirSync('src/content/clientes')
      .filter((f) => f.endsWith('.md'))
      .map((f) => /^nombre:\s*(.+?)\s*$/m.exec(readFileSync(`src/content/clientes/${f}`, 'utf-8'))![1]);
    expect(nombres).toHaveLength(20);

    const alts = doc.querySelectorAll('[data-cliente] img').map((i) => i.getAttribute('alt') ?? '');

    // Cada cliente tiene que aparecer nombrado en exactamente un alt. Así se
    // detecta tanto un alt genérico como un logotipo repetido apuntando al
    // cliente equivocado.
    for (const nombre of nombres) {
      const coincidencias = alts.filter((a) => normalizar(a).includes(normalizar(nombre)));
      expect(coincidencias, `«${nombre}» aparece en ${coincidencias.length} alt`).toHaveLength(1);
    }

    expect(alts.every((a) => !/\.(png|webp|jpe?g)/i.test(a))).toBe(true);
  });

  it('las primeras marcas no van diferidas: el muro está arriba de la página', () => {
    const imgs = doc.querySelectorAll('[data-cliente] img');
    expect(imgs.slice(0, 6).every((i) => i.getAttribute('loading') === 'eager')).toBe(true);
  });
});
