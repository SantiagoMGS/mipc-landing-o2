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
      const rastros = ['googletagmanager', 'gtag(', 'dataLayer', 'banner-cookies'];
      for (const p of paginas) {
        const html = readFileSync(p, 'utf-8');
        for (const rastro of rastros) {
          expect(html, `${p} contiene "${rastro}" sin que haya medición configurada`).not.toContain(rastro);
        }
      }
    }
  );

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
