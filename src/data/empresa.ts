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
  emailCopia: 'santiago.martinez@mipc.com.co',

  direccion: Object.freeze({
    calle: 'Carrera 66A # 34-48, Interior 101',
    barrio: 'Laureles',
    ciudad: 'Medellín',
    departamento: 'Antioquia',
    pais: 'CO',
    paisNombre: 'Colombia',
  }),

  // Confirmar con el cliente y hacer coincidir con Google Business Profile.
  // `dias` usa los valores canónicos de la enumeración DayOfWeek de schema.org.
  // NO abreviaturas: 'Mo' es válido en la propiedad de texto `openingHours`,
  // pero `openingHoursSpecification.dayOfWeek` exige el nombre completo, y
  // Google descarta el horario si no lo encuentra. La traducción al español
  // ocurre en la capa de presentación (Tasks 7 y 13), no en el dato.
  horario: Object.freeze([
    Object.freeze({ dias: Object.freeze(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']), abre: '08:00', cierra: '18:00' }),
    Object.freeze({ dias: Object.freeze(['Saturday']), abre: '08:00', cierra: '12:00' }),
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
