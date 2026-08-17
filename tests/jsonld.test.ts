import { describe, it, expect } from 'vitest';
import { localBusiness, service, breadcrumb } from '../src/lib/jsonld';
import { empresa } from '../src/data/empresa';

describe('localBusiness', () => {
  const ld = localBusiness() as any;

  it('declara el tipo y la dirección postal completa', () => {
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.address['@type']).toBe('PostalAddress');
    expect(ld.address.addressLocality).toBe('Medellín');
    expect(ld.address.streetAddress).toContain('Carrera 66A');
  });

  it('usa el teléfono en E.164', () => {
    expect(ld.telephone).toBe('+573148889078');
  });

  // Las horas exactas están fijadas a propósito, no solo su presencia: este
  // schema tiene que coincidir con la ficha de Google Business Profile, y una
  // discrepancia entre los dos es una señal contradictoria para el
  // posicionamiento local. Si alguien cambia el horario en empresa.ts sin
  // cambiarlo también en la ficha, que al menos falle aquí y se acuerde.
  it('incluye el horario confirmado como openingHoursSpecification', () => {
    expect(ld.openingHoursSpecification).toHaveLength(2);
    expect(ld.openingHoursSpecification[0].opens).toBe('08:30');
    expect(ld.openingHoursSpecification[0].closes).toBe('17:00');
    expect(ld.openingHoursSpecification[1].opens).toBe('09:00');
    expect(ld.openingHoursSpecification[1].closes).toBe('13:00');
  });

  // `description` es el campo que un modelo de lenguaje lee para resumir qué
  // es esta empresa, y el orden de la frase decide qué se cita. Hasta el
  // 2026-08-16 empezaba por «Soporte TI empresarial» y no contenía la palabra
  // «reparación» en ninguna parte — siendo reparación de computadores el
  // servicio que el cliente quiere vender por orgánico. No es una preferencia
  // de redacción: es la posición comercial del negocio, y se fija aquí para
  // que reordenar la frase sin querer rompa algo.
  it('se describe empezando por la reparación de computadores', () => {
    expect(ld.description).toMatch(/^Reparación de computadores/);
  });

  it('publica el NIT como identificador fiscal', () => {
    // Confirmado por el cliente el 2026-08-15. Es el desambiguador definitivo
    // frente a las otras empresas llamadas «MiPC»: un NIT no se repite.
    expect(ld.taxID).toBe('901401211-7');
    expect(ld.identifier.propertyID).toBe('NIT');
    expect(ld.identifier.value).toBe('901401211-7');
  });

  it('enlaza la ficha de Google en sameAs, no solo las redes sociales', () => {
    // La ficha verificada es la señal de identidad más fuerte que tenemos
    // para separar esta empresa de las otras cinco llamadas «MiPC».
    expect(ld.sameAs).toContain('https://www.google.com/maps?cid=15154712519055002689');
  });

  it('incluye las propiedades recomendadas por Google: image, priceRange y hasMap', () => {
    expect(ld.image).toBe('https://mipc.com.co/og-default.jpg');
    expect(ld.priceRange).toBe('$$');
    // hasMap se lee como «esta es su ficha», que es distinto de sameAs, que
    // se lee como «este es otro perfil suyo».
    expect(ld.hasMap).toBe('https://www.google.com/maps?cid=15154712519055002689');
  });

  // `geo` es opcional a propósito y solo debe salir con coordenadas
  // confirmadas contra el pin de la ficha de Google. Una coordenada estimada
  // a partir de la dirección contradice a la ficha, y esa contradicción es
  // peor señal que la ausencia. Esta prueba fija esa regla en los dos
  // sentidos, para que rellenar empresa.coordenadas siga siendo una decisión
  // consciente y no algo que alguien pone «para completar el schema».
  it('emite geo si y solo si hay coordenadas confirmadas en empresa.ts', () => {
    if (empresa.coordenadas) {
      expect(ld.geo['@type']).toBe('GeoCoordinates');
      expect(ld.geo.latitude).toBe(empresa.coordenadas.lat);
      expect(ld.geo.longitude).toBe(empresa.coordenadas.lng);

      // El pin tiene que caer dentro del valle de Aburrá. No es celo
      // excesivo: los tres errores reales al teclear coordenadas son
      // intercambiar latitud y longitud, comerse el signo menos y pegar las
      // de otra sede. Los tres pasan la comprobación de «es un número» y los
      // tres sitúan el negocio en otro continente sin que nada falle —
      // Google se limita a ignorar el dato, o peor, a creérselo.
      expect(ld.geo.latitude).toBeGreaterThan(6.1);
      expect(ld.geo.latitude).toBeLessThan(6.4);
      expect(ld.geo.longitude).toBeGreaterThan(-75.7);
      expect(ld.geo.longitude).toBeLessThan(-75.45);
    } else {
      expect(ld.geo).toBeUndefined();
    }
  });

  it('lista la zona de servicio', () => {
    expect(ld.areaServed.map((a: any) => a.name)).toContain('Envigado');
  });

  it('emite dayOfWeek con valores canónicos de schema.org, nunca abreviaturas', () => {
    const validDayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    ld.openingHoursSpecification.forEach((spec: any) => {
      spec.dayOfWeek.forEach((day: string) => {
        expect(validDayOfWeek).toContain(day);
        // Rechaza abreviaturas como 'Mo', 'Tu', etc., que Google no reconoce.
        expect(day).not.toMatch(/^[A-Z][a-z]$/);
      });
    });
  });
});

describe('service', () => {
  it('enlaza el servicio con el proveedor', () => {
    const ld = service({
      nombre: 'Soporte TI Empresarial',
      descripcion: 'Mesa de ayuda para empresas.',
      url: 'https://mipc.com.co/servicios/soporte-ti-empresarial/',
    }) as any;
    expect(ld['@type']).toBe('Service');
    expect(ld.provider.name).toBe('MiPC Tecnología');
    expect(ld.areaServed[0].name).toBe('Medellín');
  });

  it('omite offers cuando el servicio no publica precio', () => {
    const ld = service({
      nombre: 'Redes de Datos',
      descripcion: 'Cableado estructurado.',
      url: 'https://mipc.com.co/servicios/redes-de-datos/',
    }) as any;
    expect(ld.offers).toBeUndefined();
  });

  // El precio va como cadena y sin separador de miles porque schema.org/price
  // pide texto y Google descarta el punto: «25.000» se lee como veinticinco
  // pesos con cero céntimos. Que el test fije la forma exacta y no solo la
  // presencia es deliberado — el fallo aquí no es que falte el dato, es que
  // esté y valga mil veces menos de lo que debería.
  it('publica el precio del diagnóstico en COP, sin separador de miles', () => {
    const ld = service({
      nombre: 'Reparación de Computadores',
      descripcion: 'Reparación de computadores en Medellín.',
      url: 'https://mipc.com.co/servicios/reparacion-de-computadores/',
      oferta: { nombre: 'Diagnóstico', precio: 25000, descripcion: 'Abonable a la reparación' },
    }) as any;
    expect(ld.offers['@type']).toBe('Offer');
    expect(ld.offers.price).toBe('25000');
    expect(ld.offers.priceCurrency).toBe('COP');
    expect(ld.offers.description).toBe('Abonable a la reparación');
  });
});

describe('breadcrumb', () => {
  it('numera las posiciones desde 1', () => {
    const ld = breadcrumb([
      { nombre: 'Inicio', url: 'https://mipc.com.co/' },
      { nombre: 'Servicios', url: 'https://mipc.com.co/servicios/' },
    ]) as any;
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].position).toBe(2);
  });
});

describe('coincidencia con la ficha de Google Business Profile', () => {
  const ld = localBusiness() as any;

  /*
   * El emparejamiento entre lo que dice el sitio y lo que dice la ficha es
   * señal de posicionamiento local, y una discrepancia resta. El CID no basta:
   * hay que decir lo mismo.
   *
   * El código postal se descubrió el 2026-08-16 al vincular la ficha con GA4,
   * donde la dirección figura con «050030» y el schema del sitio no lo
   * llevaba. Si algún día se cambia la dirección en un sitio y no en el otro,
   * que al menos falle acá y no en silencio durante meses.
   */
  it('publica la dirección completa, código postal incluido', () => {
    expect(ld.address.streetAddress).toBe('Carrera 66A # 34-48, Interior 101');
    expect(ld.address.postalCode).toBe('050030');
    expect(ld.address.addressLocality).toBe('Medellín');
    expect(ld.address.addressRegion).toBe('Antioquia');
    expect(ld.address.addressCountry).toBe('CO');
  });

  it('apunta a la ficha por CID, que es el identificador estable', () => {
    expect(ld.hasMap).toContain('cid=15154712519055002689');
    expect(ld.sameAs).toContain(empresa.fichaGoogle);
  });
});
