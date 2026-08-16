import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

/**
 * La salvaguarda que hace segura toda la decisión de instalar analítica: sin
 * las variables de entorno configuradas, el sitio no emite NADA de Google.
 *
 * Se comprueba sobre las 32 páginas construidas, no sobre una. Un componente
 * puede estar bien y aun así colarse una etiqueta suelta en una plantilla que
 * nadie volvió a mirar, y con `npm run build` sin variables —que es como se
 * construye hoy— el resultado tiene que ser un sitio sin una sola línea de
 * seguimiento.
 */
const paginas = (function listar(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listar(`${dir}/${e.name}`) : e.name.endsWith('.html') ? [`${dir}/${e.name}`] : []
  );
})('dist');

const hayMedicionConfigurada = Boolean(
  process.env.PUBLIC_GA4_ID || process.env.PUBLIC_GOOGLE_ADS_ID
);

describe('analítica', () => {
  it.skipIf(hayMedicionConfigurada)(
    'sin claves configuradas no emite una sola línea de Google',
    () => {
      const rastros = [
        'googletagmanager', 'gtag(', 'dataLayer', 'banner-cookies',
        // Los eventos de conversión entran en la misma regla. Están en
        // componentes distintos del que carga las etiquetas, y ese es
        // justamente el modo en que la regla se rompe sin que se note: un
        // `gtag('event', ...)` suelto en una página no da error en el
        // navegador, solo deja de haber sitio sin analítica.
        'clic_whatsapp', 'clic_telefono', 'generate_lead', 'send_to',
      ];
      for (const p of paginas) {
        const html = readFileSync(p, 'utf-8');
        for (const rastro of rastros) {
          expect(html, `${p} contiene "${rastro}" sin que haya medición configurada`).not.toContain(rastro);
        }
      }
    }
  );

  /**
   * EventosMedicion.astro mide por el `href`: delega un manejador en
   * `document` y reconoce el canal por el prefijo del enlace. Eso lo hace
   * inmune a que alguien añada un botón nuevo, pero frágil a que cambie la
   * forma del enlace — y ese fallo es silencioso: el enlace sigue
   * funcionando, el contacto sigue llegando y solo el informe de Ads queda
   * corto. Esta prueba fija los dos prefijos contra el HTML real.
   */
  it('los prefijos que miden los eventos coinciden con los enlaces reales', () => {
    const home = readFileSync('dist/index.html', 'utf-8');
    expect(home, 'ningún enlace empieza por https://wa.me/ — clic_whatsapp no mediría nada').toContain('href="https://wa.me/');
    expect(home, 'ningún enlace empieza por tel: — clic_telefono no mediría nada').toContain('href="tel:');
  });

  /**
   * La captura de atribución NO está detrás de las claves de Google: no es
   * medición de terceros, son los parámetros de la URL con la que llegó el
   * visitante, y su valor está en el correo de Web3Forms, no en GA4. Si
   * alguien la mete dentro del `hayMedicion` «por coherencia», el día que se
   * active Ads sin haber tocado nada más los contactos llegarán sin gclid.
   */
  it('la captura de atribución se emite siempre, no depende de las claves de Google', () => {
    for (const p of ['dist/index.html', 'dist/contacto/index.html']) {
      expect(readFileSync(p, 'utf-8')).toContain('mipc-atribucion');
    }
  });

  it('la política de privacidad se publica y el pie enlaza a ella', () => {
    const politica = readFileSync('dist/privacidad/index.html', 'utf-8');
    // Los tres pilares que la Ley 1581 exige identificar: responsable,
    // canal para ejercer derechos y autoridad ante la que reclamar.
    expect(politica).toContain('MI PC TECNOLOGÍA S.A.S.');
    expect(politica).toContain('Ley 1581 de 2012');
    expect(politica).toContain('Superintendencia de Industria y Comercio');
    expect(politica).toContain('gerencia@mipc.com.co');
    // El NIT identifica al responsable de forma inequívoca. Sin él, «MI PC
    // TECNOLOGÍA S.A.S.» es un nombre que un titular no puede usar para
    // reclamar ante nadie.
    expect(politica).toContain('901401211-7');

    expect(readFileSync('dist/index.html', 'utf-8')).toContain('/privacidad/');
  });

  it('la política dice que el formulario funciona sin aceptar cookies', () => {
    // No es un detalle de redacción: si rechazar cookies limitara el
    // formulario, el consentimiento dejaría de ser libre.
    const politica = readFileSync('dist/privacidad/index.html', 'utf-8');
    expect(politica).toContain('Rechazarlas no limita nada');
  });
});
