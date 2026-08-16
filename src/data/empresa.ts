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
  /**
   * Segunda dirección que debe recibir copia de cada solicitud.
   *
   * NO la usa ninguna plantilla, y es deliberado. Se pasaba a Web3Forms en el
   * campo `ccemail` hasta el 2026-08-16, cuando el despliegue real devolvió
   * «You are trying to use a Pro feature, Please Upgrade to use ccemail» y
   * rechazó el envío completo: no es que la copia no llegara, es que no
   * llegaba nada. Ver el comentario de Formulario.astro.
   *
   * La copia se hace ahora con una regla de reenvío en la bandeja de `email`
   * (el MX del dominio es de Google). Este campo queda como registro de a
   * dónde tiene que apuntar esa regla: si algún día se cambia de proveedor de
   * formularios, aquí está el requisito, no en la configuración de un buzón
   * que nadie de este repositorio puede leer.
   */
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

  /**
   * Coordenadas de la sede, para la propiedad `geo` del schema.
   *
   * Copiadas del pin de la ficha de Google Business Profile —la misma que
   * enlaza `fichaGoogle`— y confirmadas por el cliente el 2026-08-15. Ese
   * origen es el que importa: el sitio y la ficha tienen que decir lo mismo,
   * igual que con el horario. Si el pin se mueve, esto se mueve.
   *
   * NO estimarlas a partir de la dirección si algún día hay que rehacerlas.
   * La numeración de Medellín sitúa «Carrera 66A # 34-48» con un margen de un
   * par de manzanas, y una coordenada que contradice al pin es peor señal que
   * no publicar ninguna: `localBusiness()` omite `geo` si esto es null, y esa
   * salida es preferible a inventarse el dato.
   *
   * Seis decimales, no los quince que da el navegador: el sexto ya vale unos
   * 11 cm. Los demás son ruido de coma flotante presentado como precisión.
   */
  coordenadas: { lat: 6.240407, lng: -75.586452 } as { lat: number; lng: number } | null,

  /**
   * `priceRange` en la notación que Google espera para LocalBusiness:
   * símbolos, no cifras.
   *
   * Se resiste la tentación de poner «$25.000». Eso es el precio del
   * diagnóstico de un servicio concreto —reparación de computadores— y en
   * esta propiedad se leería como el rango de precios de toda la empresa,
   * que también instala redes y CCTV por contrato. Sería un dato cierto en
   * el sitio equivocado, y de esos se sacan conclusiones falsas.
   */
  rangoPrecios: '$$',

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
