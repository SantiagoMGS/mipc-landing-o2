import type { ImageMetadata } from 'astro';

import tousRack from '../assets/proyectos/tous-arkadia-rack-cat6.webp';
import tousGabinete from '../assets/proyectos/tous-arkadia-gabinete.webp';
import oviedoIluminacion from '../assets/proyectos/oviedo-punto-info-iluminacion.webp';
import oviedoTerminado from '../assets/proyectos/oviedo-punto-info-terminado.webp';
import ingyconRack from '../assets/proyectos/ingycon-rack-firewall.webp';
import ingyconCielo from '../assets/proyectos/ingycon-cielo-raso.webp';
import globalCanalizacion from '../assets/proyectos/global-la-estrella-canalizacion.webp';
import globalTablero from '../assets/proyectos/global-la-estrella-tablero.webp';
import panesMonitor from '../assets/proyectos/los-panes-monitor-camara.webp';
import panesAlero from '../assets/proyectos/los-panes-instalacion-alero.webp';
import donDiegoCanalizacion from '../assets/proyectos/don-diego-canalizacion.webp';
import bodegaCableado from '../assets/proyectos/bodega-el-palo-cableado.webp';
import criaderoAlturas from '../assets/proyectos/criadero-gente-buena-alturas.webp';
import porteroMonitor from '../assets/proyectos/video-portero-laureles-monitor.webp';
import fpMantenimiento from '../assets/proyectos/distribuidora-fp-mantenimiento.webp';
import veterinariaRack from '../assets/proyectos/veterinaria-rosales-rack.webp';
import tablazaPerforacion from '../assets/proyectos/obra-tablaza-perforacion.webp';

export interface FotoProyecto {
  src: ImageMetadata;
  alt: string;
  pie: string;
}

/**
 * Fotografía de obra ejecutada, por id de proyecto. La primera de cada lista
 * hace de portada en el listado y de imagen principal en la página.
 *
 * Son 16 seleccionadas de un archivo de 882. No están todas a propósito: el
 * archivo mezcla fotos de trabajo con fotos de registro interno —tomas
 * desenfocadas, paredes vacías, encuadres para acordarse de dónde iba un
 * tornillo—, y publicar el archivo entero habría enterrado las buenas.
 *
 * El criterio de selección fue: se reconoce QUÉ se instaló. Un rack con su
 * patch panel ponchado, un firewall, un tablero terminado o un técnico con
 * arnés le dicen algo a quien contrata; una foto de una canaleta a medio
 * camino, no.
 */
export const fotosPorProyecto: Record<string, FotoProyecto[]> = {
  'tous-arkadia': [
    {
      src: tousRack,
      alt:
        'Técnico de MiPC Tecnología, con camiseta del uniforme de la empresa, conecta los ' +
        'cables de parcheo naranjas y azules a un patch panel categoría 6 dentro del rack de ' +
        'la tienda, con un switch Hikvision montado justo debajo',
      pie: 'Parcheo del patch panel categoría 6 sobre el switch de las cámaras',
    },
    {
      src: tousGabinete,
      alt:
        'Gabinete de comunicaciones negro con puerta perforada y cerradura, ya instalado y ' +
        'cerrado en la trastienda del local',
      pie: 'El gabinete cerrado, en la trastienda del local',
    },
  ],

  'centro-comercial-oviedo': [
    {
      src: oviedoTerminado,
      alt:
        'Punto de información terminado en el centro comercial: mueble de madera con ' +
        'estantería iluminada, riel de luces encendido en el cielo raso y, en el mueble ' +
        'inferior abierto, el rack con su patch panel y su switch integrados',
      pie: 'El punto terminado, con el rack integrado dentro del mueble',
    },
    {
      src: oviedoIluminacion,
      alt:
        'Dos técnicos de MiPC Tecnología con chaleco reflectivo instalan proyectores sobre ' +
        'un riel de iluminación en el cielo raso del punto de información, uno de pie sobre ' +
        'el mostrador y otro asegurando la base',
      pie: 'Montaje de los proyectores sobre el riel de iluminación',
    },
  ],

  'ingycon-conexion-sur': [
    {
      src: ingyconRack,
      alt:
        'Rack de comunicaciones abierto con patch panel categoría 6 de veinticuatro puertos ' +
        'y cables de parcheo rojos, un switch TP-Link de cuarenta y ocho puertos gigabit, un ' +
        'firewall Fortinet FortiGate y dos cables de fibra óptica amarillos conectados',
      pie: 'Patch panel Cat 6, switch de 48 puertos, fibra óptica y firewall FortiGate',
    },
    {
      src: ingyconCielo,
      alt:
        'Técnico de MiPC Tecnología subido en una escalera coloca una placa de cielo raso ' +
        'sobre la canalización recién tendida, junto a los tableros eléctricos del piso',
      pie: 'Cierre del cielo raso sobre la canalización tendida',
    },
  ],

  'global-la-estrella': [
    {
      src: globalTablero,
      alt:
        'Tablero eléctrico de distribución terminado, con la tapa de los breakers abierta y ' +
        'dos acometidas en tubería metálica sujetas a la pared con abrazaderas',
      pie: 'Tablero de distribución terminado, con las acometidas en tubería',
    },
    {
      src: globalCanalizacion,
      alt:
        'Tubería metálica de canalización y ducto galvanizado tendidos bajo una placa de ' +
        'concreto reticular en la planta industrial',
      pie: 'Canalización bajo la placa reticular de la planta',
    },
  ],

  'los-panes': [
    {
      src: panesMonitor,
      alt:
        'Monitor instalado en la pared mostrando en vivo la imagen de una cámara de ' +
        'seguridad, con la vista del parqueadero y la zona cubierta de la propiedad, y la ' +
        'fecha y el rótulo «Camera 01» sobreimpresos',
      pie: 'El sistema funcionando: vista en vivo del acceso y el parqueadero',
    },
    {
      src: panesAlero,
      alt:
        'Técnico de MiPC Tecnología, subido en una escalera de fibra de vidrio, instala una ' +
        'cámara bajo el alero de madera de una construcción rural, con el jardín y el paisaje ' +
        'de la propiedad al fondo',
      pie: 'Montaje bajo el alero, protegido de la lluvia y del sol directo',
    },
  ],

  'don-diego': [
    {
      src: donDiegoCanalizacion,
      alt:
        'Técnico especializado de MiPC Tecnología tiende canalización verde y una luminaria ' +
        'sobre la estructura de vigas de madera del techo de la edificación',
      pie: 'Canalización tendida sobre la estructura de madera',
    },
  ],

  'bodega-el-palo': [
    {
      src: bodegaCableado,
      alt:
        'Técnico de MiPC Tecnología prepara el cableado eléctrico sentado en el piso de la ' +
        'bodega en obra, con rollos de cable de fase y de tierra amarillo y verde, tomas sin ' +
        'instalar y herramienta alrededor',
      pie: 'Preparación del cableado eléctrico durante la adecuación',
    },
  ],

  'criadero-gente-buena': [
    {
      src: criaderoAlturas,
      alt:
        'Técnico de MiPC Tecnología con arnés de seguridad y eslinga trabaja subido a una ' +
        'escalera bajo la cubierta metálica del criadero, instalando el soporte de una cámara ' +
        'sobre una columna de acero',
      pie: 'Instalación bajo cubierta, con arnés y eslinga',
    },
  ],

  'video-portero-laureles': [
    {
      src: porteroMonitor,
      alt:
        'Monitor de video portero instalado en la pared del apartamento, encendido y ' +
        'mostrando en vivo la imagen del acceso al edificio',
      pie: 'El monitor interior, mostrando el acceso en vivo',
    },
  ],

  'distribuidora-fp': [
    {
      src: fpMantenimiento,
      alt:
        'Computador de escritorio Lenovo ThinkCentre abierto durante el mantenimiento, con ' +
        'la tarjeta madre, las memorias, el disipador y la fuente a la vista',
      pie: 'Mantenimiento interno de un equipo de escritorio',
    },
  ],

  'veterinaria-rosales': [
    {
      src: veterinariaRack,
      alt:
        'Gabinete de red de pared abierto y terminado, con patch panel categoría 6 de ' +
        'veinticuatro puertos, cables de parcheo azules peinados y un switch Nexxt de ocho ' +
        'puertos montado debajo',
      pie: 'Gabinete de pared terminado y peinado',
    },
  ],

  'obra-tablaza': [
    {
      src: tablazaPerforacion,
      alt:
        'Técnico de MiPC Tecnología con chaleco de la empresa perfora la pared de madera de ' +
        'la construcción para pasar el cableado',
      pie: 'Perforación para el paso del cableado',
    },
  ],
};
