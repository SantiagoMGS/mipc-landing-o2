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

export function service(opts: { nombre: string; descripcion: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.nombre,
    description: opts.descripcion,
    url: opts.url,
    provider: { '@type': 'LocalBusiness', '@id': ID_NEGOCIO, name: empresa.nombre },
    areaServed: empresa.zonaServicio.map((z) => ({ '@type': 'City', name: z })),
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
