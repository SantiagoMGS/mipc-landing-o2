import type { ImageMetadata } from 'astro';

import logoColombianMint from '../assets/logos/colombian-mint.png';
import logoDistribuidoraFp from '../assets/logos/distribuidora-fp.png';
import logoEipSas from '../assets/logos/eip-sas.png';
import logoEtdhPedroJustoBerrio from '../assets/logos/etdh-pedro-justo-berrio.png';
import logoGaf from '../assets/logos/gaf.png';
import logoIeElPedregal from '../assets/logos/ie-el-pedregal.png';
import logoIeProgresar from '../assets/logos/ie-progresar.png';
import logoIngenieriaYContratos from '../assets/logos/ingenieria-y-contratos.png';
import logoIpsSerIntegral from '../assets/logos/ips-ser-integral.png';
import logoLaPaisana from '../assets/logos/la-paisana.png';
import logoLrm from '../assets/logos/lrm.png';
import logoMeperSolutions from '../assets/logos/meper-solutions.png';
import logoMixFm from '../assets/logos/mix-fm.png';
import logoOceloteMinerals from '../assets/logos/ocelote-minerals.png';
import logoOlimpicaStereo from '../assets/logos/olimpica-stereo.png';
import logoQuirovida from '../assets/logos/quirovida.png';
import logoRadioTiempo from '../assets/logos/radio-tiempo.png';
import logoSeiso from '../assets/logos/seiso.png';
import logoTraumaCentro from '../assets/logos/trauma-centro.png';
import logoVanex from '../assets/logos/vanex.png';

/**
 * Logotipo de cada cliente, mapeado por el id (slug) de su ficha.
 *
 * NO viven en el frontmatter de `src/content/clientes/`, por la misma razón
 * que las fotos de proyectos y de servicios: optimizar una imagen con
 * `astro:assets` exige **importarla**, y una ruta en texto plano dentro del
 * frontmatter no se importa. Hasta el 2026-08-16 el campo `logo` era la cadena
 * `/logos/x.png` y las imágenes se servían crudas desde `public/`, sin pasar
 * por el pipeline: veinte PNG que sumaban **248 KB**, casi un tercio del peso
 * de la portada.
 *
 * Con la importación, Astro los convierte a WebP y genera el srcset. Los
 * originales están a 179x105, que es el 2x correcto para mostrarlos a 88 px;
 * el problema nunca fue la resolución sino el formato — 25 KB para un PNG de
 * 179x105 son 1,36 bytes por píxel, propio de un PNG-24 sin indexar.
 *
 * tests/clientes.test.ts comprueba que ningún cliente se quede sin logotipo,
 * que es el fallo que esta separación hace posible.
 */
export const logoPorCliente: Record<string, ImageMetadata> = {
  'colombian-mint': logoColombianMint,
  'distribuidora-fp': logoDistribuidoraFp,
  'eip-sas': logoEipSas,
  'etdh-pedro-justo-berrio': logoEtdhPedroJustoBerrio,
  'gaf': logoGaf,
  'ie-el-pedregal': logoIeElPedregal,
  'ie-progresar': logoIeProgresar,
  'ingenieria-y-contratos': logoIngenieriaYContratos,
  'ips-ser-integral': logoIpsSerIntegral,
  'la-paisana': logoLaPaisana,
  'lrm': logoLrm,
  'meper-solutions': logoMeperSolutions,
  'mix-fm': logoMixFm,
  'ocelote-minerals': logoOceloteMinerals,
  'olimpica-stereo': logoOlimpicaStereo,
  'quirovida': logoQuirovida,
  'radio-tiempo': logoRadioTiempo,
  'seiso': logoSeiso,
  'trauma-centro': logoTraumaCentro,
  'vanex': logoVanex,
};
