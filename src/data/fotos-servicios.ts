import type { ImageMetadata } from 'astro';

import fotoPosteArnes from '../assets/fotos/tecnico-poste-arnes.jpg';
import fotoControlAcceso from '../assets/fotos/tecnico-control-acceso.jpg';
import fotoRedGabinete from '../assets/fotos/equipo-red-gabinete.jpg';
import fotoFachadaAlturas from '../assets/fotos/equipo-fachada-alturas.jpg';
import fotoPosteAlto from '../assets/fotos/tecnico-poste-alto.jpg';
import fotoCanaletaTecho from '../assets/fotos/tecnico-canaleta-techo.jpg';
import fotoEscaleraAlturas from '../assets/fotos/equipo-escalera-alturas.jpg';
import fotoTechoInterior from '../assets/fotos/instalacion-techo-interior.jpg';
import fotoInstalacionPantalla from '../assets/fotos/tecnico-instalacion-pantalla.jpg';
import fotoPlacaMadre from '../assets/fotos/placa-madre-detalle.jpg';
import fotoUniformadoTaller from '../assets/fotos/tecnico-uniformado-taller.jpg';

export interface FotoServicio {
  src: ImageMetadata;
  alt: string;
  pie?: string;
}

/**
 * Fotografía real de trabajo, mapeada por el id (slug) de cada servicio.
 * Las imágenes de trabajo en alturas con casco y arnés van en las páginas
 * que hacen esa afirmación en su contenido (cámaras, redes, soporte TI):
 * es el diferenciador real frente a un competidor de reparación doméstica,
 * y el texto ya lo menciona, así que la foto lo respalda en vez de
 * inventar una credencial nueva.
 */
export const fotosPorServicio: Record<string, FotoServicio[]> = {
  'camaras-de-seguridad': [
    {
      src: fotoPosteArnes,
      alt:
        'Técnico de MiPC Tecnología con casco blanco y arnés de seguridad instala una ' +
        'cámara domo de videovigilancia en lo alto de un poste de madera, contra un cielo despejado',
      pie: 'Instalación de cámara en poste, con casco y arnés de seguridad',
    },
    {
      src: fotoControlAcceso,
      alt:
        'Técnico de MiPC Tecnología con gorra y camiseta de uniforme conecta el cableado ' +
        'de un control de acceso en el marco metálico de un portón',
      pie: 'Cableado de un sistema de control de acceso en un portón',
    },
    {
      src: fotoRedGabinete,
      alt:
        'Grabador de video en red (NVR) instalado en un gabinete metálico, con etiqueta ' +
        'de inventario, como parte de un sistema de videovigilancia',
      pie: 'Grabador de video (NVR) instalado en el gabinete de equipos',
    },
  ],
  'redes-de-datos': [
    {
      src: fotoFachadaAlturas,
      alt:
        'Dos técnicos de MiPC Tecnología con arnés de seguridad instalan cableado en la ' +
        'fachada interior de una nave industrial, uno sobre una escalera y otro en una plataforma elevada',
      pie: 'Cableado en fachada industrial, con arnés de seguridad',
    },
    {
      src: fotoPosteAlto,
      alt:
        'Técnico de MiPC Tecnología con casco y arnés de seguridad, en lo alto de un poste ' +
        'de concreto, conecta cableado de red desde una escalera de fibra de vidrio',
      pie: 'Trabajo en altura sobre poste, con casco y arnés',
    },
    {
      src: fotoCanaletaTecho,
      alt:
        'Técnico de MiPC Tecnología, subido en una escalera baja, poncha un cable de red ' +
        'junto a un tablero eléctrico y una caja de paso cerca del techo',
      pie: 'Cableado de red junto al tablero eléctrico de un edificio',
    },
  ],
  'soporte-ti-empresarial': [
    {
      src: fotoEscaleraAlturas,
      alt:
        'Dos técnicos con casco y arnés de seguridad instalan una tubería de conducción ' +
        'para cableado en el interior de una nave industrial, uno en lo alto de una escalera y otro sosteniendo el tramo inferior',
      pie: 'Instalación de canalización para cableado en una nave industrial',
    },
    {
      src: fotoTechoInterior,
      alt:
        'Técnico de MiPC Tecnología, subido en una escalera plegable, instala un punto ' +
        'eléctrico bajo el techo de vigas de madera de una vivienda en construcción',
      pie: 'Instalación de un punto eléctrico bajo cubierta',
    },
  ],
  'reparacion-de-computadores': [
    {
      src: fotoInstalacionPantalla,
      alt:
        'Técnico de MiPC Tecnología con tapabocas repara un computador todo en uno, con ' +
        'la parte trasera abierta y la tarjeta madre a la vista, sobre una mesa plegable en la calle',
      pie: 'Reparación de un computador todo en uno',
    },
    {
      src: fotoPlacaMadre,
      alt:
        'Vista cercana del interior de un computador de escritorio abierto, con la tarjeta ' +
        'madre, el disipador del procesador y las memorias RAM a la vista',
      pie: 'Mantenimiento del interior de un computador de escritorio',
    },
  ],
  'alquiler-de-computadores': [
    {
      src: fotoUniformadoTaller,
      alt:
        'Técnico de MiPC Tecnología, de espaldas y con uniforme de la empresa, revisa un ' +
        'computador de escritorio en el taller',
      pie: 'Revisión de un equipo de escritorio en el taller',
    },
  ],
};
