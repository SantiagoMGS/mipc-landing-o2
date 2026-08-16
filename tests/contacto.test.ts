import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('contacto', () => {
  const doc = parse(readFileSync('dist/contacto/index.html', 'utf-8'));

  it('publica la dirección completa para el posicionamiento local', () => {
    const html = doc.toString();
    expect(html).toContain('Carrera 66A # 34-48');
  });

  it('el formulario redirige a /gracias/ para poder medir la conversión', () => {
    const redirect = doc.querySelector('input[name="redirect"]')?.getAttribute('value');
    // Web3Forms redirige desde su servidor: una ruta relativa no funcionaría.
    // Comprobar solo que contiene '/gracias/' dejaría pasar esa regresión.
    expect(redirect).toMatch(/^https:\/\/mipc\.com\.co\/gracias\/$/);
  });

  it('tiene honeypot antispam oculto', () => {
    expect(doc.querySelector('input[name="botcheck"]')).toBeTruthy();
  });

  /**
   * `ccemail` es una función de pago de Web3Forms, y en el plan gratuito no se
   * ignora sin más: **rechaza el envío completo** con «You are trying to use a
   * Pro feature». El 2026-08-16 el formulario estuvo devolviendo ese error en
   * el despliegue real, es decir, sin recibir una sola solicitud.
   *
   * El test mira el campo y no el plan porque es lo único comprobable desde
   * aquí: si alguien contrata Pro y quiere recuperarlo, que tenga que borrar
   * esta prueba a conciencia y no que se le cuele de vuelta sin pensarlo.
   */
  it('NO envía ccemail: es de pago y en el plan gratuito rompe el formulario', () => {
    expect(doc.querySelector('input[name="ccemail"]')).toBeFalsy();
  });

  /**
   * Sin el gclid junto al contacto, una venta que se cierra por teléfono tres
   * semanas después no puede volver a Google Ads como conversión offline, y
   * Ads sigue optimizando hacia «formularios enviados» sin saber cuáles
   * acabaron en dinero. Va en su propio campo, separado de los UTM, porque es
   * el que se copia tal cual a la plantilla de conversiones offline.
   */
  it('el formulario lleva campos para el gclid y el origen de la visita', () => {
    expect(doc.querySelector('input[name="gclid"]')).toBeTruthy();
    expect(doc.querySelector('input[name="origen"]')).toBeTruthy();
  });

  it('nacen deshabilitados, para que un contacto orgánico no envíe campos vacíos', () => {
    // Un campo deshabilitado no se envía. El script los habilita solo si hay
    // atribución guardada; si no, el correo de Web3Forms llega limpio en vez
    // de con dos filas en blanco que nadie sabe interpretar.
    for (const nombre of ['gclid', 'origen']) {
      const campo = doc.querySelector(`input[name="${nombre}"]`);
      expect(campo?.hasAttribute('disabled'), `${nombre} debería nacer disabled`).toBe(true);
    }
  });

  it('cada campo tiene su label asociada', () => {
    for (const id of ['nombre', 'email', 'telefono', 'mensaje']) {
      expect(doc.querySelector(`label[for="${id}"]`)).toBeTruthy();
      expect(doc.querySelector(`#${id}`)).toBeTruthy();
    }
  });
});

describe('gracias (SEO-05: página de agradecimiento sin valor en búsqueda)', () => {
  it('/gracias/ lleva noindex,follow — útil al visitante, invisible para Google', () => {
    const doc = parse(readFileSync('dist/gracias/index.html', 'utf-8'));
    const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content');
    expect(robots).toBe('noindex,follow');
  });

  // Un noindex que se filtre a una página real sería peor que el problema
  // que resuelve: nos quitaría del buscador sin que nadie lo note.
  it('el resto del sitio NO lleva noindex por accidente', () => {
    const doc = parse(readFileSync('dist/index.html', 'utf-8'));
    expect(doc.querySelector('meta[name="robots"]')).toBeFalsy();
  });
});
