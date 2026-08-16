/**
 * Configuración de medición, leída en un solo sitio.
 *
 * Cuatro componentes necesitan saber si hay medición configurada —Analitica,
 * BannerCookies, EventosMedicion y ConversionFormulario— y hasta ahora cada
 * uno repetía la misma expresión `Boolean(import.meta.env...)`. Repetirla
 * cuatro veces es la forma en que la REGLA DE ORO se rompe: basta que un
 * componente nuevo la escriba con un `||` de menos para que emita etiquetas
 * de Google en un sitio sin analítica configurada, y el fallo no se ve en la
 * página, solo en el HTML.
 *
 * REGLA DE ORO: sin `PUBLIC_GA4_ID` ni `PUBLIC_GOOGLE_ADS_ID` el sitio no
 * emite una sola línea de Google —ni script, ni dataLayer, ni banner, ni
 * eventos—. Lo comprueba tests/analitica.test.ts contra el build real.
 */
export const ga4Id: string | undefined = import.meta.env.PUBLIC_GA4_ID;
export const adsId: string | undefined = import.meta.env.PUBLIC_GOOGLE_ADS_ID;

/**
 * Etiqueta de la acción de conversión de Google Ads, la mitad derecha del
 * identificador que Ads muestra como `AW-123456789/AbC-D_efGhIj`. Va en su
 * propia variable porque el `AW-…` es del *conjunto* de la cuenta —lo usa
 * también `gtag('config')`— y la etiqueta es de *una* acción de conversión
 * concreta. Mezclarlos en una sola variable obliga a partir la cadena en dos
 * sitios distintos y a que los dos coincidan.
 */
export const etiquetaConversion: string | undefined =
  import.meta.env.PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

/** Hay algo que medir: GA4, Ads, o los dos. */
export const hayMedicion = Boolean(ga4Id || adsId);

/**
 * Valor de `send_to` para la conversión de formulario enviado.
 *
 * `undefined` si falta cualquiera de las dos mitades: una conversión de Ads
 * con el identificador a medias no se registra en ningún sitio y además no
 * da error, así que es mejor no emitirla y que el hueco se vea en Ads que
 * emitir una que se pierde en silencio.
 */
export const envioConversion: string | undefined =
  adsId && etiquetaConversion ? `${adsId}/${etiquetaConversion}` : undefined;
