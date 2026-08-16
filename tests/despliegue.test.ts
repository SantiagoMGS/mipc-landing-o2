import { describe, it, expect } from 'vitest';
import { enPlataformaDeDespliegue } from '../src/lib/despliegue';

/**
 * Esta función decide si las guardas de build se disparan. Si devuelve false
 * donde debería devolver true, el build pasa en verde y publica un formulario
 * que acepta envíos y los pierde: el fallo no se ve en la página, solo en las
 * cotizaciones que nunca llegan.
 *
 * Ya ocurrió: la guarda comprobaba únicamente `CF_PAGES` y el proyecto se
 * desplegó en Workers, donde esa variable no existe.
 */
describe('enPlataformaDeDespliegue', () => {
  it('detecta Cloudflare Pages', () => {
    expect(enPlataformaDeDespliegue({ CF_PAGES: '1' })).toBe(true);
  });

  // La regresión concreta que costó la red de seguridad. Workers Builds no
  // fija CF_PAGES; fija WORKERS_CI.
  it('detecta Cloudflare Workers Builds, que es donde vive este proyecto', () => {
    expect(enPlataformaDeDespliegue({ WORKERS_CI: '1' })).toBe(true);
  });

  it('no se dispara en un build local, para poder revisar el sitio sin claves', () => {
    expect(enPlataformaDeDespliegue({})).toBe(false);
  });

  // `CI` a secas la fijan GitHub Actions y casi cualquier otro corredor. Un
  // build de CI no publica nada, así que exigirle las claves reales rompería
  // la verificación automática sin proteger de nada.
  it('no confunde un CI cualquiera con la plataforma de despliegue', () => {
    expect(enPlataformaDeDespliegue({ CI: 'true' })).toBe(false);
  });
});
