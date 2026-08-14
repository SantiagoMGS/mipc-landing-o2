/**
 * Fuente única de verdad del NAP (nombre, dirección, teléfono).
 *
 * REGLA: ninguna plantilla escribe teléfono, dirección o correo a mano.
 * Todo se lee de aquí, de modo que cambiar un dato lo cambia en el pie de
 * página, en /contacto/, en el JSON-LD y en los enlaces de WhatsApp a la vez.
 */
export const empresa = Object.freeze({
  nombre: 'MiPC Tecnología',
  nombreLegal: 'MiPC Tecnología S.A.S.',
  descripcionCorta:
    'Soporte TI empresarial, redes, CCTV y alquiler de equipos en Medellín.',
  fundacion: 2009,
  url: 'https://mipc.com.co',

  telefono: '314 888 90 78',
  telefonoE164: '+573148889078',
  whatsapp: '573148889078',
  email: 'gerencia@mipc.com.co',

  direccion: Object.freeze({
    calle: 'Carrera 87A # 32-81, Interior 305',
    barrio: 'Laureles',
    ciudad: 'Medellín',
    departamento: 'Antioquia',
    pais: 'CO',
  }),

  // Confirmar con el cliente y hacer coincidir con Google Business Profile.
  horario: Object.freeze([
    Object.freeze({ dias: Object.freeze(['Mo', 'Tu', 'We', 'Th', 'Fr']), abre: '08:00', cierra: '18:00' }),
    Object.freeze({ dias: Object.freeze(['Sa']), abre: '08:00', cierra: '12:00' }),
  ]),

  zonaServicio: Object.freeze([
    'Medellín', 'Envigado', 'Sabaneta', 'Itagüí', 'Bello', 'La Estrella',
  ]),

  redes: Object.freeze({
    facebook: 'https://www.facebook.com/mipctecnologiasas',
    instagram: 'https://www.instagram.com/mipc.com.co/',
  }),
});

export type Empresa = typeof empresa;
