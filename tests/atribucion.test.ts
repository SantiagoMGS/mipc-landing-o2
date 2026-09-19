import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

/**
 * La captura de atribución, EJECUTADA.
 *
 * Los demás tests de medición comprueban que el script esté en el HTML. Eso
 * basta para una etiqueta de terceros, que o carga o no carga, pero no para
 * este script: aquí lo que puede fallar es la lógica de cuándo escribe y
 * cuándo no, y esa no se ve en una cadena de texto.
 *
 * El caso que motivó el componente lo demuestra. Hasta el 2026-09-19 el
 * script existía, estaba en todas las páginas y un test lo confirmaba, y aun
 * así una visita desde ChatGPT llegaba al correo sin una sola fila de origen:
 * solo guardaba algo si la URL traía `gclid` o `utm_*`. El test pasaba y el
 * canal era invisible.
 *
 * Se ejecuta el script REAL extraído de `dist/`, no una copia, para que no
 * pueda quedarse comprobando una versión que ya nadie sirve.
 */

let fuente: string;

beforeAll(() => {
  const html = readFileSync('dist/index.html', 'utf-8');
  const bloques = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const script = bloques.find((b) => b.includes('mipc-atribucion') && b.includes('referenteExterno'));
  if (!script) throw new Error('No se encontró el script de Atribucion.astro en dist/index.html');
  fuente = script;
});

/** Corre el script con un navegador de mentira y devuelve lo que dejó guardado. */
function visitar(opts: { url: string; referente: string; guardado?: string | null }) {
  const almacen: Record<string, string> = {};
  if (opts.guardado) almacen['mipc-atribucion'] = opts.guardado;
  const u = new URL(opts.url);

  runInNewContext(fuente, {
    document: { referrer: opts.referente },
    location: { search: u.search, pathname: u.pathname, hostname: u.hostname },
    sessionStorage: {
      getItem: (k: string) => (k in almacen ? almacen[k] : null),
      setItem: (k: string, v: string) => { almacen[k] = v; },
    },
    URL,
    URLSearchParams,
    JSON,
  });

  const crudo = almacen['mipc-atribucion'];
  return crudo ? JSON.parse(crudo) : null;
}

describe('captura de atribución', () => {
  it('guarda el host cuando la visita llega recomendada por un asistente de IA', () => {
    // El caso real: una clienta describió su necesidad en ChatGPT, le nombró a
    // MiPC y llegó al sitio. Sin campaña, sin UTM y sin gclid.
    const datos = visitar({ url: 'https://mipc.com.co/', referente: 'https://chatgpt.com/c/abc123' });
    expect(datos?.referente).toBe('chatgpt.com');
    expect(datos?.pagina_entrada).toBe('/');
  });

  it('guarda solo el dominio, nunca la ruta del referente', () => {
    // La ruta de un buscador puede llevar dentro lo que escribió la persona.
    // Está declarado así en /privacidad/, apartado 2.
    const datos = visitar({
      url: 'https://mipc.com.co/servicios/redes-de-datos/',
      referente: 'https://www.google.com/search?q=camaras+de+seguridad+medellin',
    });
    expect(datos?.referente).toBe('google.com');
    expect(JSON.stringify(datos)).not.toContain('search');
  });

  it('la navegación interna no pisa de dónde vino la visita', () => {
    // Sin esto, cualquier segunda página borraría el dato: en la página 2 el
    // referente es el propio sitio.
    const previo = JSON.stringify({ referente: 'chatgpt.com', pagina_entrada: '/' });
    const datos = visitar({
      url: 'https://mipc.com.co/contacto/',
      referente: 'https://mipc.com.co/',
      guardado: previo,
    });
    expect(datos?.referente).toBe('chatgpt.com');
    expect(datos?.pagina_entrada).toBe('/');
  });

  it('salir a otro sitio y volver tampoco pisa la entrada original', () => {
    // Abrir la ficha de Google Maps desde el sitio y volver atribuiría el
    // contacto a Maps, que es justo el sitio al que lo mandamos nosotros.
    const previo = JSON.stringify({ referente: 'chatgpt.com', pagina_entrada: '/' });
    const datos = visitar({
      url: 'https://mipc.com.co/contacto/',
      referente: 'https://www.google.com/maps/place/MiPC',
      guardado: previo,
    });
    expect(datos?.referente).toBe('chatgpt.com');
  });

  it('una campaña sí gana: es el dato más preciso', () => {
    const datos = visitar({
      url: 'https://mipc.com.co/?gclid=ABC123&utm_source=google&utm_campaign=reparacion',
      referente: 'https://www.google.com/',
      guardado: JSON.stringify({ referente: 'chatgpt.com', pagina_entrada: '/' }),
    });
    expect(datos?.gclid).toBe('ABC123');
    expect(datos?.utm_campaign).toBe('reparacion');
  });

  it('una visita directa no guarda nada, como antes', () => {
    // Escribir siempre llenaría el correo de filas vacías que nadie sabe leer.
    expect(visitar({ url: 'https://mipc.com.co/', referente: '' })).toBeNull();
  });

  it('www y sin www son el mismo sitio', () => {
    expect(visitar({ url: 'https://mipc.com.co/', referente: 'https://www.mipc.com.co/blog/' })).toBeNull();
  });
});
