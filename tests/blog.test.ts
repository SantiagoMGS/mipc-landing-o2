import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('blog', () => {
  it('el índice existe y lista las entradas', () => {
    expect(existsSync('dist/blog/index.html')).toBe(true);
    const doc = parse(readFileSync('dist/blog/index.html', 'utf-8'));
    expect(doc.querySelectorAll('article').length).toBeGreaterThanOrEqual(3);
  });

  it('cada entrada emite JSON-LD de tipo Article', () => {
    const doc = parse(readFileSync('dist/blog/mantenimiento-preventivo-empresas/index.html', 'utf-8'));
    const tipos = doc
      .querySelectorAll('script[type="application/ld+json"]')
      .map((b) => JSON.parse(b.text)['@type']);
    expect(tipos).toContain('Article');
  });

  it('las fechas se muestran en español en el índice Y en las entradas', () => {
    // La lista debe cubrir los doce meses: una versión anterior omitía July,
    // justo el mes de una de las tres entradas, así que una regresión de
    // locale en esa fecha habría pasado sin detectarse.
    const MESES_EN = /January|February|March|April|May|June|July|August|September|October|November|December/;
    const paginas = [
      'dist/blog/index.html',
      'dist/blog/mantenimiento-preventivo-empresas/index.html',
      'dist/blog/alquilar-o-comprar-computadores/index.html',
      'dist/blog/camaras-seguridad-que-preguntar/index.html',
    ];
    for (const p of paginas) {
      const html = readFileSync(p, 'utf-8');
      expect(html, p).not.toMatch(MESES_EN);
      expect(html, p).toMatch(/de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de \d{4}/);
    }
  });
});

describe('blog conectado con los servicios', () => {
  const entradas = readdirSync('src/content/blog')
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  /*
   * El 2026-08-16 se midió que NINGUNA entrada del blog enlazaba a un
   * servicio. Ni una. Una entrada así es un callejón sin salida: explica algo,
   * lo explica bien, y deja al lector sin saber a quién llamar. El tráfico que
   * ganara no tenía ruta hacia la página que convierte.
   *
   * El campo `servicio` del frontmatter es opcional a propósito —una nota o un
   * aviso pueden no servir a ninguno— pero si se declara tiene que existir, y
   * el bloque de llamada a la acción tiene que llegar al HTML.
   */
  it('el servicio declarado por una entrada existe de verdad', () => {
    const servicios = readdirSync('src/content/servicios')
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''));

    for (const e of entradas) {
      const m = /^servicio:\s*(\S+)\s*$/m.exec(readFileSync(`src/content/blog/${e}.md`, 'utf-8'));
      if (!m) continue;
      expect(servicios, `${e} declara el servicio «${m[1]}», que no existe`).toContain(m[1]);
    }
  });

  it('la entrada que declara servicio publica su bloque de contacto', () => {
    for (const e of entradas) {
      const fuente = readFileSync(`src/content/blog/${e}.md`, 'utf-8');
      if (!/^servicio:\s*\S+/m.test(fuente)) continue;

      const html = readFileSync(`dist/blog/${e}/index.html`, 'utf-8');
      expect(html, `${e} declara servicio pero no enlaza a ninguno`)
        .toMatch(/href="\/servicios\/[a-z-]+\/"/);
      expect(html, `${e} no ofrece WhatsApp`).toContain('wa.me');
    }
  });
});
