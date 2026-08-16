/**
 * ¿Este build va a producción, o es uno local que solo quiere ver el sitio?
 *
 * Sirve para que las guardas de build —hoy la de `PUBLIC_WEB3FORMS_KEY` en
 * Formulario.astro— fallen en la plataforma de despliegue y no estorben en
 * local: cualquiera debe poder compilar y revisar el sitio sin las claves
 * reales, pero un build que sí se va a publicar tiene que detenerse antes de
 * subir un formulario que acepta envíos y los pierde.
 *
 * HAY QUE MIRAR LAS DOS VARIABLES. `CF_PAGES` la fija Cloudflare Pages;
 * `WORKERS_CI`, Workers Builds. Este proyecto acabó en Workers —Pages estaba
 * en mantenimiento para proyectos nuevos cuando se creó, ver
 * docs/despliegue-corte-dominio.md— y durante un tiempo la guarda comprobó
 * solo `CF_PAGES`: es decir, estuvo sin tender justo en la plataforma que se
 * usa. Ese es el fallo que esta función existe para no repetir, y es de los
 * peores que hay: una guarda que no se dispara no avisa de que no se dispara.
 * El build habría pasado en verde publicando un formulario roto.
 *
 * Recibe el entorno por parámetro para poder probarla sin tocar `process.env`
 * del proceso de test.
 */
export function enPlataformaDeDespliegue(
  env: Record<string, string | undefined> = process.env
): boolean {
  return Boolean(env.CF_PAGES || env.WORKERS_CI);
}
