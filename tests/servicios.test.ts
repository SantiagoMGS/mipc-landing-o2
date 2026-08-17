import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parse } from 'node-html-parser';

const slugs = [
  'soporte-ti-empresarial', 'reparacion-de-computadores', 'camaras-de-seguridad',
  'redes-de-datos', 'instalaciones-electricas', 'alquiler-de-computadores',
];

// Esta lista se escribe a mano, así que se comprueba contra el disco: un
// servicio nuevo que no se añada aquí queda fuera de TODAS las pruebas de
// abajo sin que nada avise, que es peor que no tenerlas.
it('la lista de slugs cubre todos los servicios publicados', () => {
  const enDisco = readdirSync('src/content/servicios')
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
  expect(slugs.slice().sort()).toEqual(enDisco.sort());
});

describe('páginas de servicio', () => {
  it('cada servicio tiene su propia URL', () => {
    for (const s of slugs) {
      expect(existsSync(`dist/servicios/${s}/index.html`)).toBe(true);
    }
  });

  it('cada una tiene exactamente una h1 con la ciudad', () => {
    for (const s of slugs) {
      const doc = parse(readFileSync(`dist/servicios/${s}/index.html`, 'utf-8'));
      const h1 = doc.querySelectorAll('h1');
      expect(h1).toHaveLength(1);
      expect(h1[0].text).toContain('Medellín');
    }
  });

  it('cada una emite JSON-LD de tipo Service', () => {
    for (const s of slugs) {
      const doc = parse(readFileSync(`dist/servicios/${s}/index.html`, 'utf-8'));
      const tipos = doc
        .querySelectorAll('script[type="application/ld+json"]')
        .map((b) => JSON.parse(b.text)['@type']);
      expect(tipos).toContain('Service');
    }
  });

  // El fallo que este test existe para impedir: el botón flotante de WhatsApp
  // llevaba un texto fijo —«quiero consultar por un servicio para mi
  // empresa»— en TODAS las páginas, incluida la de reparación. Un particular
  // con el portátil roto abría WhatsApp y se encontraba escrito «para mi
  // empresa». Siendo el flotante el elemento más pulsado en móvil, era la
  // fuga de conversión más cara del sitio, y ningún test lo veía porque
  // whatsapp.test.ts comprueba la función y el problema estaba en quién la
  // llama. Por eso se mira el HTML construido y no la librería.
  it('ninguna página de servicio ofrece un WhatsApp «para mi empresa»', () => {
    for (const s of slugs) {
      const html = readFileSync(`dist/servicios/${s}/index.html`, 'utf-8');
      expect(html, `${s} conserva el mensaje genérico de empresa`)
        .not.toContain('para%20mi%20empresa');
    }
  });

  it('el flotante y el CTA de una misma página precargan el mismo mensaje', () => {
    for (const s of slugs) {
      const html = readFileSync(`dist/servicios/${s}/index.html`, 'utf-8');
      const mensajes = new Set([...html.matchAll(/https:\/\/wa\.me\/\d+\?text=([^"]+)/g)].map((m) => m[1]));
      expect(mensajes.size, `${s} emite ${mensajes.size} mensajes distintos`).toBe(1);
    }
  });

  it('reparación habla al particular, no a quien contrata para su empresa', () => {
    const html = readFileSync('dist/servicios/reparacion-de-computadores/index.html', 'utf-8');
    expect(decodeURIComponent(html)).toContain('tengo un computador dañado');
  });

  it('alquiler habla de alquiler y no de redes (CONT-01)', () => {
    const html = readFileSync('dist/servicios/alquiler-de-computadores/index.html', 'utf-8');
    expect(html).toContain('por contrato');
    expect(html).not.toContain('administración de redes de datos y eléctricas');
  });
});

describe('orden de los servicios', () => {
  /*
   * El `orden` decide la posición de la tarjeta en la portada y en /servicios/.
   * Dos servicios con el mismo número no rompen el build: se ordenan como
   * quiera el motor y la portada cambia de disposición sin motivo aparente
   * entre despliegues. Pasó el 2026-08-16 al abrir la línea de instalaciones
   * eléctricas con el mismo `orden` que alquiler.
   */
  // Se lee del frontmatter y no de `astro:content`: ese módulo lo inyecta
  // Astro en tiempo de compilación y no existe bajo vitest a secas.
  it('ningún servicio comparte número de orden con otro', () => {
    const ordenes = readdirSync('src/content/servicios')
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const m = /^orden:\s*(\d+)\s*$/m.exec(readFileSync(`src/content/servicios/${f}`, 'utf-8'));
        expect(m, `${f} no declara orden`).not.toBeNull();
        return `${f} → ${m![1]}`;
      });

    const numeros = ordenes.map((o) => o.split('→')[1].trim());
    expect(new Set(numeros).size, `\n  ${ordenes.join('\n  ')}\n`).toBe(numeros.length);
  });
});
