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
  /*
   * El modelo de consentimiento del sitio, fijado contra el CÓDIGO FUENTE de
   * los componentes y no contra dist/.
   *
   * El motivo es la regla de oro de medicion.ts: sin `PUBLIC_GA4_ID` el sitio
   * no emite una sola línea de Google, y esa clave vive en las Build variables
   * de Cloudflare, no en el entorno local ni en CI. Un test que buscara el
   * `consent default` en dist/index.html pasaría en verde por vacío en cuanto
   * alguien lo ejecutara sin clave — que es siempre, aquí. La política de
   * consentimiento vive en el componente, así que ahí se comprueba.
   *
   * Es la clase de cosa que se cambia por accidente y no se nota nunca: nadie
   * mira el `consent default` al revisar un cambio de estilos, y una medición
   * que arranca concedida donde debía arrancar denegada —o al revés— no
   * produce ningún síntoma visible en la página.
   *
   * El 2026-08-16 se pasó de permiso previo a aviso, por decisión de Santiago
   * y con revisión legal pendiente. Si algún día se vuelve atrás, que sea
   * porque alguien cambió estos tests a propósito.
   */
  const analitica = readFileSync('src/components/Analitica.astro', 'utf-8');
  const banner = readFileSync('src/components/ui/BannerCookies.astro', 'utf-8');

  it('mide por defecto y respeta el rechazo guardado, sin `update` intermedio', () => {
    // La decisión se LEE antes de fijar el valor por defecto. Si se hiciera
    // con un `consent update` posterior habría una ventana, por breve que
    // fuera, en la que se mide a alguien que ya había rechazado.
    expect(analitica).toContain("localStorage.getItem('mipc-consentimiento') === 'rechazado'");
    expect(analitica).toMatch(/ad_storage: rechazado \? 'denied' : 'granted'/);
    expect(analitica).toMatch(/analytics_storage: rechazado \? 'denied' : 'granted'/);

    // Las dos que nunca dependen de la decisión: no son de seguimiento.
    expect(analitica).toMatch(/functionality_storage: 'granted'/);
    expect(analitica).toMatch(/security_storage: 'granted'/);

    // Y que no quede un `update` concediendo, que es lo que había antes.
    expect(analitica).not.toContain("'consent', 'update'");
  });

  it('el botón de rechazar deniega las cuatro categorías de seguimiento', () => {
    expect(banner).toContain("if (valor === 'rechazado'");
    const bloque = banner.slice(banner.indexOf("if (valor === 'rechazado'"));
    for (const categoria of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']) {
      expect(bloque, `${categoria} no se deniega al rechazar`).toContain(`${categoria}: 'denied'`);
    }
  });

  it('el aviso deja de aparecer a quien lo ignora', () => {
    // Con el modelo de aviso la medición ya está activa, así que insistir no
    // consigue ningún dato: solo molesta. Antes volvía en cada visita a quien
    // no pulsaba ningún botón, que es la mayoría.
    expect(banner).toContain('mipc-aviso-vistas');
    expect(banner).toContain('vistas < MAX_VISTAS');
  });

  it('la política de privacidad no promete permiso previo', () => {
    // La contradicción más cara posible: que el sitio mida por defecto y la
    // política diga que no mide hasta que aceptes.
    const politica = readFileSync('dist/privacidad/index.html', 'utf-8');
    expect(politica).not.toContain('No se activan hasta que las aceptas');
    expect(politica).toContain('puedes desactivarlas con un clic');
  });
});
