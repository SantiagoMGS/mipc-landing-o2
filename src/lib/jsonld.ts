import { empresa } from '../data/empresa';

const ID_NEGOCIO = `${empresa.url}/#negocio`;

export function localBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': ID_NEGOCIO,
    name: empresa.nombre,
    legalName: empresa.nombreLegal,
    // El NIT como identificador fiscal. Es el desambiguador más fuerte que
    // existe frente a las otras empresas llamadas «MiPC»: la ficha de Google
    // y los perfiles sociales se parecen entre negocios homónimos, un NIT no
    // se repite.
    taxID: empresa.nit,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'NIT',
      value: empresa.nit,
    },
    description: empresa.descripcionCorta,
    url: empresa.url,
    telephone: empresa.telefonoE164,
    email: empresa.email,
    foundingDate: String(empresa.fundacion),
    // Propiedad recomendada por Google para LocalBusiness. Se reutiliza la
    // imagen social del sitio en vez de importar una del directorio de
    // assets: `src/assets/` lleva el nombre con hash del build y esta
    // función no está dentro del grafo de Astro, así que no puede resolverlo.
    // `public/og-default.jpg` tiene URL estable, que es lo que el schema pide.
    image: new URL('/og-default.jpg', empresa.url).href,
    priceRange: empresa.rangoPrecios,
    // Enlace directo al mapa. El CID ya está en `sameAs`, pero `hasMap` es la
    // propiedad que Google lee como «esta es su ficha», no como «este es otro
    // perfil suyo».
    hasMap: empresa.fichaGoogle,
    // Solo si están confirmadas contra el pin de la ficha (ver empresa.ts).
    // Omitir `geo` no cuesta nada; publicarla mal contradice a la ficha.
    ...(empresa.coordenadas
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: empresa.coordenadas.lat,
            longitude: empresa.coordenadas.lng,
          },
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: empresa.direccion.calle,
      addressLocality: empresa.direccion.ciudad,
      addressRegion: empresa.direccion.departamento,
      addressCountry: empresa.direccion.pais,
    },
    openingHoursSpecification: empresa.horario.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...h.dias],
      opens: h.abre,
      closes: h.cierra,
    })),
    areaServed: empresa.zonaServicio.map((z) => ({ '@type': 'City', name: z })),
    sameAs: [empresa.redes.facebook, empresa.redes.instagram, empresa.fichaGoogle],
  };
}

export function service(opts: {
  nombre: string;
  descripcion: string;
  url: string;
  /**
   * Precio de entrada, si la página lo publica. Se convierte en `offers`.
   *
   * Es la diferencia entre que un modelo de lenguaje responda «$25.000» y que
   * responda «consulta con el proveedor»: en prosa el precio es una frase que
   * hay que interpretar; en `offers` es un dato con moneda.
   */
  oferta?: { nombre: string; precio: number; descripcion?: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.nombre,
    description: opts.descripcion,
    url: opts.url,
    provider: { '@type': 'LocalBusiness', '@id': ID_NEGOCIO, name: empresa.nombre },
    areaServed: empresa.zonaServicio.map((z) => ({ '@type': 'City', name: z })),
    ...(opts.oferta
      ? {
          offers: {
            '@type': 'Offer',
            name: opts.oferta.nombre,
            // Cadena, no número: schema.org/price pide texto y Google
            // rechaza el separador de miles. 25000, nunca «25.000».
            price: String(opts.oferta.precio),
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock',
            ...(opts.oferta.descripcion ? { description: opts.oferta.descripcion } : {}),
          },
        }
      : {}),
  };
}

export function breadcrumb(items: Array<{ nombre: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nombre,
      item: item.url,
    })),
  };
}

export function article(opts: {
  titulo: string; descripcion: string; url: string; fecha: Date; imagen?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.titulo,
    description: opts.descripcion,
    url: opts.url,
    datePublished: opts.fecha.toISOString(),
    author: { '@type': 'Organization', name: empresa.nombre },
    publisher: { '@type': 'Organization', '@id': ID_NEGOCIO, name: empresa.nombre },
    ...(opts.imagen ? { image: opts.imagen } : {}),
  };
}
