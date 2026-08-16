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

  /**
   * NIT con dígito de verificación. Confirmado por el cliente el 2026-08-15.
   *
   * No es un dato administrativo más. «MiPC» colisiona con al menos cinco
   * entidades de nombre casi idéntico —entre ellas una tienda mexicana en
   * mipc.com.mx que el cliente confirma que NO es suya—, y hay evidencia de
   * que los modelos de lenguaje ya las mezclan. El NIT es el identificador
   * único e inequívoco de una empresa en Colombia: es la señal más fuerte
   * que existe para separarlas, más que la ficha de Google y más que
   * cualquier perfil social.
   */
  nit: '901401211-7',
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

  // Confirmado por el cliente el 2026-08-15. Debe coincidir EXACTAMENTE con la
  // ficha de Google Business Profile (CID 15154712519055002689): una
  // discrepancia entre el schema del sitio y la ficha es señal negativa para el
  // posicionamiento local. Si cambia el horario, cambia en los dos sitios.
  //
  // `dias` usa los valores canónicos de la enumeración DayOfWeek de schema.org.
  // NO abreviaturas: 'Mo' es válido en la propiedad de texto `openingHours`,
  // pero `openingHoursSpecification.dayOfWeek` exige el nombre completo, y
  // Google descarta el horario si no lo encuentra. La traducción al español
  // ocurre en la capa de presentación (Tasks 7 y 13), no en el dato.
  horario: Object.freeze([
    Object.freeze({ dias: Object.freeze(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']), abre: '08:00', cierra: '17:00' }),
    Object.freeze({ dias: Object.freeze(['Saturday']), abre: '09:00', cierra: '13:00' }),
  ]),

  zonaServicio: Object.freeze([
    'Medellín', 'Envigado', 'Sabaneta', 'Itagüí', 'Bello', 'La Estrella',
  ]),

  redes: Object.freeze({
    facebook: 'https://www.facebook.com/mipctecnologiasas',
    instagram: 'https://www.instagram.com/mipc.com.co/',
  }),

  /**
   * Ficha de Google Business Profile, por CID. Es el identificador estable de
   * la ficha: sobrevive a cambios de nombre y de dirección, cosa que las URLs
   * largas de Maps con coordenadas no hacen.
   *
   * No es decorativo. «MiPC» colisiona con al menos cinco entidades de nombre
   * casi idéntico —entre ellas una tienda mexicana en mipc.com.mx y una
   * gamer en Barranquilla—, y hay evidencia de que los modelos de lenguaje ya
   * las mezclan: a un resumen de «MiPC Tecnología Medellín» le atribuyeron
   * quejas de envíos de la tienda mexicana. Una ficha verificada enlazada
   * desde `sameAs` es la señal más fuerte disponible para separarlas, y a
   * diferencia del NIT —que sigue pendiente— ya la tenemos.
   */
  fichaGoogle: 'https://www.google.com/maps?cid=15154712519055002689',
});

export type Empresa = typeof empresa;
