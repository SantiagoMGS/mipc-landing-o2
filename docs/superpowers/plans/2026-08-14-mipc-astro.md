# Reconstrucción de mipc.com.co en Astro — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir mipc.com.co como sitio estático en Astro, con 13 URLs de contenido, reenfoque B2B, y controles automáticos que hacen irrepetibles los fallos de la auditoría.

**Architecture:** Astro 7 con salida 100% estática, sin adaptador ni rutas de servidor. El contenido vive en Markdown validado por esquemas Zod que rompen la compilación si falta un campo obligatorio. Un único módulo `empresa.ts` es la fuente de verdad del NAP y alimenta pie de página, contacto, JSON-LD y enlaces de WhatsApp. Los controles de calidad (una sola `h1`, meta description, `alt`, enlaces rotos) corren sobre `dist/` después de compilar y fallan el build.

**Tech Stack:** Astro 7.2.2, TypeScript, Tailwind 4 (vía `@tailwindcss/vite`), Vitest 4, node-html-parser, linkinator, `@astrojs/sitemap`, Fontsource (Archivo Variable + IBM Plex Mono), Web3Forms, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-08-14-mipc-astro-design.md`

## Global Constraints

Estos requisitos aplican a **todas** las tareas. Copiados literalmente del spec.

- **Idioma del documento:** `lang="es-CO"` en todas las páginas. Nunca `en-US`. (Corrige CRIT-05.)
- **Una y solo una `<h1>` por página.** (Corrige SEO-01.)
- **`metaDescription` obligatoria** en toda página. (Corrige SEO-02.)
- **`alt` obligatorio y descriptivo** en toda imagen. Nunca el nombre del archivo. (Corrige SEO-07.)
- **Formato de title:** `<Servicio o página> en Medellín | MiPC Tecnología`. Nunca terminar en `mipc.com.co`. (Corrige SEO-03.)
- **Paleta exacta:** fondo `#F2F4F5`, superficie `#FFFFFF`, tinta `#0F1620`, ancla `#1E3A47`, señal `#EB3A00`. Se admiten neutrales de apoyo (`tinta-2`, `borde`) derivados de esa base; lo que es exacto son los cinco valores de marca.
- **Superficies rellenas que llevan texto usan `senal-fuerte` (`#D33400`), no `senal`.** El naranja de marca mide 4,09:1 contra blanco y 4,44:1 contra la tinta: falla AA para texto normal en ambas direcciones. `#D33400` da 4,93:1 contra blanco. `senal` se reserva para acentos, filetes, estados y focos, donde el umbral es 3:1 y sí cumple.
- **Tipografía:** solo Archivo Variable e IBM Plex Mono, autoalojadas. Prohibido enlazar Google Fonts.
- **Naranja `#EB3A00` solo como color de señal:** botones, estado activo, dato destacado. Nunca como fondo de secciones enteras.
- **Contraste WCAG AA como mínimo** en todo texto. (Corrige DIS-02.)
- **Cero ondas** ni separadores decorativos. (Corrige DIS-01.)
- **Salida estática:** sin adaptador, sin SSR, sin rutas de servidor.
- **El NAP se lee siempre de `src/data/empresa.ts`.** Nunca escribir teléfono, dirección o correo a mano en una plantilla.
- **Español de Colombia** en toda la copia visible, con tildes correctas. La auditoría encontró «Confian», «porder» y «Tecnologia».

---

## Estructura de archivos

```
astro.config.mjs              Config: sitio, sitemap, Tailwind
package.json                  Scripts: build, test, check:html, check:links, verify
src/
  content.config.ts           Colecciones + esquemas Zod (validación que rompe el build)
  data/
    empresa.ts                NAP único: fuente de verdad
    redirecciones.ts          Mapa 301 → genera public/_redirects
  styles/global.css           Tailwind + tokens de diseño + fuentes
  lib/
    jsonld.ts                 Generadores de LocalBusiness, Service, BreadcrumbList, Article
    whatsapp.ts               Construye enlaces wa.me con mensaje precargado
  components/
    SEO.astro                 head completo: title, meta, canonical, OG, JSON-LD
    layout/{Header,Footer,Nav}.astro
    ui/{Boton,Cifra,TarjetaServicio,MuroClientes,Figura,CTAWhatsApp,Formulario}.astro
  layouts/{Base,Pagina,Servicio,Entrada}.astro
  pages/
    index.astro  nosotros.astro  clientes.astro  contacto.astro
    gracias.astro  garantias.astro  recursos.astro  404.astro
    servicios/index.astro  servicios/[slug].astro
    blog/index.astro  blog/[slug].astro
  content/
    servicios/*.md  clientes/*.md  casos/*.md  blog/*.md  paginas/*.md
  assets/fotos/                Las 12 fotos seleccionadas, renombradas
public/
  logos/                       Logos de clientes (PNG 179×105)
  _redirects                   Generado por scripts/generar-redirecciones.mjs
scripts/
  generar-redirecciones.mjs    redirecciones.ts → public/_redirects
  check-html.mjs               h1 única, meta description, alt, lang sobre dist/
  check-redirecciones.mjs      Valida las 301 en producción tras el corte
tests/
  empresa.test.ts  jsonld.test.ts  whatsapp.test.ts  contenido.test.ts
```

---

### Task 1: Andamiaje del proyecto

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/pages/index.astro`, `src/styles/global.css`, `vitest.config.ts`
- Test: `tests/andamiaje.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: proyecto Astro 7 que compila a `dist/`; scripts npm `build`, `test`, `verify`

- [ ] **Step 1: Crear el proyecto Astro**

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
npm install
npm install --save-dev vitest@4 node-html-parser@9 linkinator@8
npm install @astrojs/sitemap@3
npx astro add tailwind --yes
```

- [ ] **Step 2: Configurar Astro**

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mipc.com.co',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

`trailingSlash: 'always'` reproduce el formato de URL actual de WordPress y evita una capa extra de redirecciones.

- [ ] **Step 3: Añadir los scripts npm**

En `package.json`, reemplazar el bloque `scripts`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "check:html": "node scripts/check-html.mjs",
    "check:links": "linkinator dist --recurse --silent --skip 'wa.me|api.web3forms.com'",
    "verify": "astro check && npm run build && npm test && npm run check:html && npm run check:links"
  }
}
```

- [ ] **Step 4: Configurar Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Los tests que leen dist/ exigen compilar antes. El script `verify`
    // ya encadena build antes de test.
  },
});
```

- [ ] **Step 5: Escribir el test de andamiaje**

`tests/andamiaje.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('andamiaje', () => {
  it('compila a dist/index.html', () => {
    expect(existsSync('dist/index.html')).toBe(true);
  });

  it('declara el idioma es-CO, no en-US', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    expect(html).toContain('lang="es-CO"');
    expect(html).not.toContain('en-US');
  });
});
```

- [ ] **Step 6: Ejecutar el test para verificar que falla**

Run: `npm test`
Expected: FAIL — `dist/index.html` no existe todavía.

- [ ] **Step 7: Crear la página mínima con el idioma correcto**

`src/pages/index.astro`:

```astro
---
import '../styles/global.css';
---
<!doctype html>
<html lang="es-CO">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MiPC Tecnología</title>
  </head>
  <body>
    <h1>MiPC Tecnología</h1>
  </body>
</html>
```

`src/styles/global.css`:

```css
@import "tailwindcss";
```

- [ ] **Step 8: Compilar y ejecutar el test**

Run: `npm run build && npm test`
Expected: PASS, ambos tests en verde.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: andamiaje Astro 7 con Tailwind, Vitest y scripts de verificación"
```

---

### Task 2: NAP único en empresa.ts

**Files:**
- Create: `src/data/empresa.ts`
- Test: `tests/empresa.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `empresa` — objeto congelado en profundidad con los campos `nombre`, `nombreLegal`, `descripcionCorta`, `fundacion`, `telefono`, `telefonoE164`, `whatsapp`, `email`, `direccion{calle,barrio,ciudad,departamento,pais,paisNombre}`, `horario[]`, `zonaServicio[]`, `redes{facebook,instagram}`, `url`. Consumido por Tasks 3, 4, 7, 13.

> **Sin `codigoPostal`.** Una versión anterior de esta línea lo listaba. Ningún consumidor lo usa —la Task 3 construye `PostalAddress` sin `postalCode`, y las Tasks 7 y 13 solo leen calle, barrio, ciudad y departamento— y schema.org no lo exige. Como no se conoce el código postal real de la dirección, inventarlo metería un dato falso en el `LocalBusiness`, que para posicionamiento local es peor que omitir el campo.

> **El congelado debe ser profundo.** `Object.freeze` no es recursivo: congelar una entrada de `horario` deja su array `dias` mutable. Si el módulo promete que nadie lo mute en tiempo de render, la promesa tiene que ser cierta en todos los niveles, y el test tiene que verificarlo en todos los niveles — `Object.isFrozen(empresa)` por sí solo pasa aunque se borren todos los congelados internos.

> **Dato a confirmar antes del lanzamiento:** el horario de atención. El valor de abajo es el que se usará mientras el cliente no indique otro, y **debe coincidir exactamente con el que se publique en Google Business Profile** — una discrepancia entre el schema del sitio y la ficha de Google es una señal negativa para el posicionamiento local. Añadir a la lista de verificación previa al corte (Task 17).

- [ ] **Step 1: Escribir el test**

`tests/empresa.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { empresa } from '../src/data/empresa';

describe('empresa (NAP)', () => {
  it('tiene el teléfono en formato E.164 para schema y enlaces tel:', () => {
    expect(empresa.telefonoE164).toBe('+573148889078');
  });

  it('tiene dirección completa, no solo la ciudad', () => {
    expect(empresa.direccion.calle).toBe('Carrera 87A # 32-81, Interior 305');
    expect(empresa.direccion.ciudad).toBe('Medellín');
    expect(empresa.direccion.barrio).toBe('Laureles');
  });

  it('tiene correo de contacto', () => {
    expect(empresa.email).toBe('gerencia@mipc.com.co');
  });

  it('declara al menos una franja horaria', () => {
    expect(empresa.horario.length).toBeGreaterThan(0);
  });

  it('es inmutable, para que nadie lo mute en tiempo de render', () => {
    expect(Object.isFrozen(empresa)).toBe(true);
  });
});
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npx vitest run tests/empresa.test.ts`
Expected: FAIL — no se puede resolver `../src/data/empresa`.

- [ ] **Step 3: Escribir empresa.ts**

`src/data/empresa.ts`:

```ts
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
    paisNombre: 'Colombia',
  }),

  // Confirmar con el cliente y hacer coincidir con Google Business Profile.
  // `dias` usa los valores canónicos de la enumeración DayOfWeek de schema.org.
  // NO abreviaturas: 'Mo' es válido en la propiedad de texto `openingHours`,
  // pero `openingHoursSpecification.dayOfWeek` exige el nombre completo, y
  // Google descarta el horario si no lo encuentra. La traducción al español
  // ocurre en la capa de presentación (Tasks 7 y 13), no en el dato.
  horario: Object.freeze([
    Object.freeze({
      dias: Object.freeze(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      abre: '08:00',
      cierra: '18:00',
    }),
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
```

- [ ] **Step 4: Ejecutar el test**

Run: `npx vitest run tests/empresa.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/empresa.ts tests/empresa.test.ts
git commit -m "feat: NAP único en empresa.ts como fuente de verdad"
```

---

### Task 3: Generadores de JSON-LD

**Files:**
- Create: `src/lib/jsonld.ts`
- Test: `tests/jsonld.test.ts`

**Interfaces:**
- Consumes: `empresa` de Task 2
- Produces: `localBusiness(): object`, `service(opts: {nombre: string; descripcion: string; url: string}): object`, `breadcrumb(items: Array<{nombre: string; url: string}>): object`, `article(opts: {titulo: string; descripcion: string; url: string; fecha: Date; imagen?: string}): object`. Consumido por Tasks 4, 10, 14.

- [ ] **Step 1: Escribir el test**

`tests/jsonld.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { localBusiness, service, breadcrumb } from '../src/lib/jsonld';

describe('localBusiness', () => {
  const ld = localBusiness() as any;

  it('declara el tipo y la dirección postal completa', () => {
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.address['@type']).toBe('PostalAddress');
    expect(ld.address.addressLocality).toBe('Medellín');
    expect(ld.address.streetAddress).toContain('Carrera 87A');
  });

  it('usa el teléfono en E.164', () => {
    expect(ld.telephone).toBe('+573148889078');
  });

  it('incluye el horario como openingHoursSpecification', () => {
    expect(ld.openingHoursSpecification).toHaveLength(2);
    expect(ld.openingHoursSpecification[0].opens).toBe('08:00');
  });

  it('lista la zona de servicio', () => {
    expect(ld.areaServed.map((a: any) => a.name)).toContain('Envigado');
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
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npx vitest run tests/jsonld.test.ts`
Expected: FAIL — no se puede resolver `../src/lib/jsonld`.

- [ ] **Step 3: Escribir jsonld.ts**

`src/lib/jsonld.ts`:

```ts
import { empresa } from '../data/empresa';

const ID_NEGOCIO = `${empresa.url}/#negocio`;

export function localBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': ID_NEGOCIO,
    name: empresa.nombre,
    legalName: empresa.nombreLegal,
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
    sameAs: [empresa.redes.facebook, empresa.redes.instagram],
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
```

- [ ] **Step 4: Ejecutar el test**

Run: `npx vitest run tests/jsonld.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/jsonld.ts tests/jsonld.test.ts
git commit -m "feat: generadores de JSON-LD derivados del NAP"
```

---

### Task 4: Componente SEO y layout Base

**Files:**
- Create: `src/components/SEO.astro`, `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/seo.test.ts`

**Interfaces:**
- Consumes: `localBusiness()` de Task 3
- Produces: `<Base title metaDescription {jsonld?} {imagenOg?}>` — layout que toda página debe usar. Consumido por Tasks 10 a 14.

- [ ] **Step 1: Escribir el test**

`tests/seo.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

let doc: ReturnType<typeof parse>;
beforeAll(() => { doc = parse(readFileSync('dist/index.html', 'utf-8')); });

describe('cabecera SEO', () => {
  it('el title termina en la marca, nunca en el dominio', () => {
    const t = doc.querySelector('title')!.text;
    expect(t).toMatch(/\| MiPC Tecnología$/);
    expect(t).not.toContain('mipc.com.co');
  });

  it('tiene meta description no vacía', () => {
    const d = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(d && d.length).toBeGreaterThan(50);
  });

  it('tiene canonical absoluta', () => {
    const c = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(c).toMatch(/^https:\/\/mipc\.com\.co\//);
  });

  it('tiene Open Graph con imagen, que hoy falta al compartir por WhatsApp', () => {
    expect(doc.querySelector('meta[property="og:title"]')).toBeTruthy();
    expect(doc.querySelector('meta[property="og:image"]')).toBeTruthy();
  });

  it('emite el JSON-LD de LocalBusiness', () => {
    const bloques = doc.querySelectorAll('script[type="application/ld+json"]');
    const tipos = bloques.map((b) => JSON.parse(b.text)['@type']);
    expect(tipos).toContain('LocalBusiness');
  });
});
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npm run build && npx vitest run tests/seo.test.ts`
Expected: FAIL — no hay meta description ni JSON-LD.

- [ ] **Step 3: Escribir SEO.astro**

`src/components/SEO.astro`:

```astro
---
import { localBusiness } from '../lib/jsonld';
import { empresa } from '../data/empresa';

export interface Props {
  title: string;
  metaDescription: string;
  jsonld?: object[];
  imagenOg?: string;
}

const { title, metaDescription, jsonld = [], imagenOg } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
const og = new URL(imagenOg ?? '/og-default.jpg', Astro.site).href;
const bloques = [localBusiness(), ...jsonld];
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={metaDescription} />
<link rel="canonical" href={canonical} />

<meta property="og:type" content="website" />
<meta property="og:site_name" content={empresa.nombre} />
<meta property="og:locale" content="es_CO" />
<meta property="og:title" content={title} />
<meta property="og:description" content={metaDescription} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={og} />
<meta name="twitter:card" content="summary_large_image" />

{bloques.map((b) => (
  <script type="application/ld+json" set:html={JSON.stringify(b)} />
))}
```

- [ ] **Step 4: Escribir Base.astro**

`src/layouts/Base.astro`:

`Base.astro` **deriva** su tipo de props del de `SEO.astro` en vez de redeclararlo. Si se redeclara, añadir un prop al componente SEO más adelante lo deja sin propagar en silencio a través del layout — y las Tasks 10 a 14 consumen todas este layout.

Para que funcione, `SEO.astro` debe declarar su interfaz como `export interface Props`.

```astro
---
import SEO from '../components/SEO.astro';
import type { Props as PropsSEO } from '../components/SEO.astro';
import '../styles/global.css';

type Props = PropsSEO;
const { title, metaDescription, jsonld, imagenOg } = Astro.props;
---
<!doctype html>
<html lang="es-CO">
  <head>
    <SEO {title} {metaDescription} {jsonld} {imagenOg} />
  </head>
  <body class="bg-fondo text-tinta antialiased">
    <slot />
  </body>
</html>
```

- [ ] **Step 5: Usar el layout en la home provisional**

`src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Soporte TI Empresarial en Medellín | MiPC Tecnología"
  metaDescription="Soporte TI, redes de datos, CCTV y alquiler de equipos para empresas en Medellín. Atendemos emisoras, IPS e instituciones educativas desde 2009."
>
  <h1>MiPC Tecnología</h1>
</Base>
```

- [ ] **Step 6: Añadir una imagen Open Graph provisional**

Copiar cualquiera de las fotos seleccionadas a `public/og-default.jpg`, recortada a 1200×630 px. Sin este archivo el test de `og:image` pasa pero el enlace compartido muestra una imagen rota.

```bash
node -e "console.log('Colocar public/og-default.jpg de 1200x630 antes de continuar')"
```

- [ ] **Step 7: Compilar y ejecutar el test**

Run: `npm run build && npx vitest run tests/seo.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: componente SEO y layout Base con JSON-LD y Open Graph"
```

---

### Task 5: Colecciones de contenido con validación que rompe el build

**Files:**
- Create: `src/schemas.ts`, `src/content.config.ts`
- Test: `tests/contenido.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `esquemaServicio`, `esquemaCliente`, `esquemaCaso`, `esquemaEntrada`, `esquemaPagina` en `src/schemas.ts`; colecciones `servicios`, `clientes`, `casos`, `blog`, `paginas` en `src/content.config.ts`. Consumido por Tasks 9 a 14.

Esta es la tarea que hace irrepetibles SEO-02 y SEO-07: si un servicio no trae `metaDescription`, o una foto no trae `alt`, **la compilación falla**.

> **Por qué los esquemas van en su propio archivo.** `content.config.ts` importa de `astro:content`, que es un módulo virtual que solo existe dentro del build de Astro — Vitest no puede resolverlo. Poniendo los esquemas en `src/schemas.ts`, que solo importa de `astro/zod` (una ruta real del paquete), quedan testeables sin levantar Astro.

- [ ] **Step 1: Escribir el test**

`tests/contenido.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { esquemaServicio } from '../src/schemas';

describe('esquema de servicio', () => {
  const valido = {
    titulo: 'Soporte TI Empresarial',
    h1: 'Soporte TI empresarial en Medellín',
    metaTitle: 'Soporte TI Empresarial en Medellín | MiPC Tecnología',
    metaDescription: 'Mesa de ayuda, soporte remoto y en sitio para empresas en Medellín con más de 15 años de experiencia.',
    resumen: 'Mesa de ayuda y soporte para empresas.',
    publico: 'empresa',
    orden: 1,
  };

  it('acepta un servicio completo', () => {
    expect(() => esquemaServicio.parse(valido)).not.toThrow();
  });

  it('rechaza un servicio sin metaDescription', () => {
    const { metaDescription, ...sinMeta } = valido;
    expect(() => esquemaServicio.parse(sinMeta)).toThrow();
  });

  it('rechaza una metaDescription demasiado corta para ser útil', () => {
    expect(() => esquemaServicio.parse({ ...valido, metaDescription: 'Corta.' })).toThrow();
  });

  it('rechaza un metaTitle que termine en el dominio', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, metaTitle: 'Servicios – mipc.com.co' })
    ).toThrow();
  });

  it('rechaza una imagen sin alt', () => {
    expect(() =>
      esquemaServicio.parse({ ...valido, imagen: { src: './foto.jpg' } })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npx vitest run tests/contenido.test.ts`
Expected: FAIL — no se puede resolver `../src/schemas`.

- [ ] **Step 3: Escribir los esquemas**

`src/schemas.ts`:

```ts
import { z } from 'astro/zod';

/**
 * Imagen con alt obligatorio y descriptivo. Corrige SEO-07.
 *
 * La longitud mínima no basta: `foto-tecnico-instalando-servidor.jpg` tiene
 * 37 caracteres y sigue siendo un nombre de archivo sin valor descriptivo,
 * que es exactamente el defecto que la auditoría encontró. Por eso hay que
 * rechazar además el patrón de extensión de imagen.
 */
const imagen = z.object({
  src: z.string(),
  alt: z
    .string()
    .min(10, 'El alt debe describir la escena, no ser el nombre del archivo')
    .refine((a) => !/\.(jpe?g|png|gif|svg|webp|avif)$/i.test(a.trim()), {
      message: 'El alt es un nombre de archivo. Describe qué se ve en la imagen.',
    }),
});

/**
 * Campos de SEO que toda página de contenido debe traer.
 *
 * El título lleva DOS comprobaciones, no una: exigir el sufijo de marca no
 * impide que el dominio aparezca en medio. «Servicios de mipc.com.co en
 * Medellín | MiPC Tecnología» termina bien y sigue mostrando el dominio
 * como marca, que es el hallazgo SEO-03.
 */
const seo = {
  metaTitle: z
    .string()
    .min(20, 'Demasiado corto para incluir el servicio y la ciudad')
    .max(65, 'Google lo truncará en el resultado de búsqueda')
    .refine((t) => t.endsWith('| MiPC Tecnología'), {
      message: 'El título debe terminar en "| MiPC Tecnología"',
    })
    .refine((t) => !t.includes('mipc.com.co'), {
      message: 'El título no puede contener el dominio: la marca es MiPC Tecnología',
    }),
  metaDescription: z
    .string()
    .min(70, 'Demasiado corta para servir de argumento en el resultado de búsqueda')
    .max(165, 'Google la truncará'),
};

export const esquemaServicio = z.object({
  titulo: z.string(),
  h1: z.string(),
  ...seo,
  resumen: z.string().min(20, 'El resumen debe decir algo, no ser una etiqueta'),
  publico: z.enum(['empresa', 'persona', 'ambos']),
  orden: z.number().int(),
  imagen: imagen.optional(),
  beneficios: z.array(z.string()).default([]),
  faq: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })).default([]),
});

export const esquemaCliente = z.object({
  nombre: z.string(),
  sector: z.string(),
  logo: z.string().optional(),
  orden: z.number().int().default(99),
});

export const esquemaCaso = z.object({
  cliente: z.string(),
  sector: z.string(),
  reto: z.string(),
  solucion: z.string(),
  resultado: z.string(),
  imagen: imagen.optional(),
  orden: z.number().int().default(99),
});

export const esquemaEntrada = z.object({
  titulo: z.string(),
  ...seo,
  fecha: z.coerce.date(),
  resumen: z.string().min(20, 'El resumen debe decir algo, no ser una etiqueta'),
  imagen: imagen.optional(),
});

export const esquemaPagina = z.object({
  titulo: z.string(),
  h1: z.string(),
  ...seo,
});
```

- [ ] **Step 4: Conectar los esquemas a las colecciones**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  esquemaServicio, esquemaCliente, esquemaCaso, esquemaEntrada, esquemaPagina,
} from './schemas';

const dir = (n: string) => `./src/content/${n}`;
const md = '**/*.md';

export const collections = {
  servicios: defineCollection({ loader: glob({ pattern: md, base: dir('servicios') }), schema: esquemaServicio }),
  clientes: defineCollection({ loader: glob({ pattern: md, base: dir('clientes') }), schema: esquemaCliente }),
  casos: defineCollection({ loader: glob({ pattern: md, base: dir('casos') }), schema: esquemaCaso }),
  blog: defineCollection({ loader: glob({ pattern: md, base: dir('blog') }), schema: esquemaEntrada }),
  paginas: defineCollection({ loader: glob({ pattern: md, base: dir('paginas') }), schema: esquemaPagina }),
};
```

- [ ] **Step 5: Ejecutar el test**

Run: `npx vitest run tests/contenido.test.ts && npm run build`
Expected: PASS 5 tests, y build sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/schemas.ts src/content.config.ts tests/contenido.test.ts
git commit -m "feat: colecciones con validación Zod que rompe el build si falta SEO"
```

---

### Task 6: Sistema visual — tokens y tipografía autoalojada

**Files:**
- Modify: `src/styles/global.css`
- Test: `tests/visual.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: clases utilitarias de Tailwind `bg-fondo`, `bg-superficie`, `text-tinta`, `bg-ancla`, `text-senal`, `font-display`, `font-mono`, y la clase `.cifra`. Consumido por todas las tareas de interfaz.

- [ ] **Step 1: Instalar las fuentes**

```bash
npm install @fontsource-variable/archivo@5 @fontsource/ibm-plex-mono@5
```

- [ ] **Step 2: Escribir el test**

`tests/visual.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

describe('sistema visual', () => {
  const css = readdirSync('dist/_astro')
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`dist/_astro/${f}`, 'utf-8'))
    .join('\n');

  it('usa la paleta exacta del spec', () => {
    expect(css).toContain('#f2f4f5');
    expect(css).toContain('#eb3a00');
    expect(css).toContain('#1e3a47');
  });

  it('no enlaza Google Fonts: las fuentes van autoalojadas', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });
});
```

- [ ] **Step 3: Ejecutar el test para verificar que falla**

Run: `npm run build && npx vitest run tests/visual.test.ts`
Expected: FAIL — la paleta no está definida.

- [ ] **Step 4: Escribir global.css**

`src/styles/global.css`:

Dos detalles del import que deciden si el diseño funciona:

- **`standard.css`, no el import a secas.** El punto de entrada por defecto de `@fontsource-variable/archivo` instancia solo el eje `wght` y **elimina el eje `wdth`**, con lo que `font-variation-settings: "wdth" 118` en los titulares no hace absolutamente nada. `standard.css` conserva ambos ejes.
- **Subconjuntos latinos explícitos.** El import genérico de IBM Plex Mono arrastra cirílico, vietnamita y griego. El navegador no los descarga gracias a `unicode-range`, pero se emiten al build y contradicen el spec. Los latinos compensan de sobra los bytes que suma `standard.css`.

```css
@import "tailwindcss";
@import "@fontsource-variable/archivo/standard.css";
@import "@fontsource/ibm-plex-mono/latin-400.css";
@import "@fontsource/ibm-plex-mono/latin-600.css";

@theme {
  --color-fondo: #f2f4f5;
  --color-superficie: #ffffff;
  --color-tinta: #0f1620;
  --color-tinta-2: #5a636b;
  --color-ancla: #1e3a47;
  --color-senal: #eb3a00;
  --color-senal-fuerte: #d33400;
  --color-senal-oscuro: #b32a00;
  --color-ancla-oscuro: #162c36;
  --color-borde: #dce1e4;

  --font-display: "Archivo Variable", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
}

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-display);
  font-variation-settings: "wdth" 100;
}

/* Titulares en el ancho expandido del MISMO archivo variable.
   No existe ni hace falta una familia "Archivo Expanded" aparte. */
h1, h2, h3 {
  font-variation-settings: "wdth" 118;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

/* Cifras: mono con numerales tabulares. Un dato medido, no un eslogan. */
.cifra {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Incluye los controles de formulario: la Task 13 los necesita y su foco
   debe verse igual que el del resto. `senal` da 3,70:1 sobre el fondo y
   4,09:1 sobre superficie — por encima del 3:1 que exige un indicador. */
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--color-senal);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: Compilar y ejecutar el test**

Run: `npm run build && npx vitest run tests/visual.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: tokens de diseño y tipografía autoalojada"
```

---

### Task 7: Header, Footer y navegación

**Files:**
- Create: `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`, `src/lib/whatsapp.ts`
- Modify: `src/layouts/Base.astro`
- Test: `tests/whatsapp.test.ts`, `tests/layout.test.ts`

**Interfaces:**
- Consumes: `empresa` de Task 2
- Produces: `enlaceWhatsApp(mensaje?: string): string` en `src/lib/whatsapp.ts`; `<Header />` y `<Footer />` incluidos automáticamente por `Base.astro`. Consumido por Tasks 10 a 14.

El pie corrige CRIT-04: hoy solo dice «Medellín – Colombia», sin dirección, correo ni horario.

- [ ] **Step 1: Escribir el test de WhatsApp**

`tests/whatsapp.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { enlaceWhatsApp } from '../src/lib/whatsapp';

describe('enlaceWhatsApp', () => {
  it('apunta al número de la empresa', () => {
    expect(enlaceWhatsApp()).toContain('https://wa.me/573148889078');
  });

  it('precarga el mensaje codificado', () => {
    const url = enlaceWhatsApp('Hola, me interesa el servicio de cámaras de seguridad');
    expect(url).toContain('text=Hola%2C%20me%20interesa');
  });
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `npx vitest run tests/whatsapp.test.ts`
Expected: FAIL — no se puede resolver `../src/lib/whatsapp`.

- [ ] **Step 3: Escribir whatsapp.ts**

`src/lib/whatsapp.ts`:

```ts
import { empresa } from '../data/empresa';

/** Enlace a WhatsApp con mensaje precargado según el contexto de la página. */
export function enlaceWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${empresa.whatsapp}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}
```

- [ ] **Step 4: Escribir el Header**

`src/components/layout/Header.astro`:

```astro
---
import { empresa } from '../../data/empresa';

const enlaces = [
  { texto: 'Servicios', href: '/servicios/' },
  { texto: 'Clientes', href: '/clientes/' },
  { texto: 'Nosotros', href: '/nosotros/' },
  { texto: 'Recursos', href: '/recursos/' },
  { texto: 'Blog', href: '/blog/' },
  { texto: 'Contacto', href: '/contacto/' },
];
const actual = Astro.url.pathname;
---
<header class="border-b border-borde bg-superficie">
  <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
    <a href="/" class="shrink-0" aria-label={`${empresa.nombre} — inicio`}>
      <img src="/logo-mipc.svg" alt="Logotipo de MiPC Tecnología" width="132" height="40" />
    </a>

    <nav aria-label="Principal" class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {enlaces.map((e) => (
        <a
          href={e.href}
          aria-current={actual.startsWith(e.href) ? 'page' : undefined}
          class:list={[
            'py-1 hover:text-senal',
            actual.startsWith(e.href) ? 'border-b-2 border-senal font-semibold' : '',
          ]}
        >{e.texto}</a>
      ))}
    </nav>

    <a
      href={`tel:${empresa.telefonoE164}`}
      class="cifra ml-auto rounded-sm bg-senal-fuerte px-4 py-2 text-sm font-semibold text-white hover:bg-senal-oscuro"
    >{empresa.telefono}</a>
  </div>
</header>
```

- [ ] **Step 5: Escribir el Footer**

`src/components/layout/Footer.astro`:

```astro
---
import { empresa } from '../../data/empresa';

// `empresa.horario[].dias` guarda los valores canónicos de schema.org.
// La traducción al español vive aquí, en la capa de presentación.
const dias: Record<string, string> = {
  Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié',
  Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom',
};
const ORDEN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/**
 * Rotula «Lun a Vie» SOLO si los días son consecutivos. Con días sueltos
 * los enumera. Un rango inventado sobre días no contiguos anunciaría un
 * horario falso — alguien se presentaría un día que está cerrado.
 */
const franja = (h: (typeof empresa.horario)[number]) => {
  const idx = h.dias.map((d) => ORDEN.indexOf(d));
  const consecutivos = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  const etiqueta =
    h.dias.length === 1
      ? dias[h.dias[0]]
      : consecutivos
        ? `${dias[h.dias[0]]} a ${dias[h.dias[h.dias.length - 1]]}`
        : h.dias.map((d) => dias[d]).join(', ');
  return `${etiqueta}: ${h.abre} a ${h.cierra}`;
};
---
<footer class="mt-20 border-t border-borde bg-ancla text-white">
  <div class="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
    <div>
      <p class="text-lg font-semibold">{empresa.nombre}</p>
      <p class="mt-2 text-sm text-white/70">{empresa.descripcionCorta}</p>
      <p class="cifra mt-4 text-sm text-white/70">
        Atendiendo empresas desde {empresa.fundacion}
      </p>
    </div>

    <div class="text-sm">
      <h2 class="font-semibold">Contacto</h2>
      <address class="mt-3 not-italic text-white/80">
        {empresa.direccion.calle}<br />
        {empresa.direccion.barrio}, {empresa.direccion.ciudad}<br />
        {empresa.direccion.departamento}, {empresa.direccion.paisNombre}
      </address>
      <p class="mt-3">
        <a class="cifra hover:text-senal" href={`tel:${empresa.telefonoE164}`}>{empresa.telefono}</a>
      </p>
      <p><a class="hover:text-senal" href={`mailto:${empresa.email}`}>{empresa.email}</a></p>
    </div>

    <div class="text-sm">
      <h2 class="font-semibold">Horario</h2>
      <ul class="mt-3 space-y-1 text-white/80">
        {empresa.horario.map((h) => <li class="cifra">{franja(h)}</li>)}
      </ul>
      <h2 class="mt-6 font-semibold">Cobertura</h2>
      <p class="mt-2 text-white/80">{empresa.zonaServicio.join(' · ')}</p>
    </div>
  </div>

  <div class="border-t border-white/10">
    <div class="mx-auto flex max-w-6xl flex-wrap gap-4 px-5 py-5 text-xs text-white/60">
      <p>© {new Date().getFullYear()} {empresa.nombreLegal}</p>
      <a class="hover:text-senal" href="/garantias/">Políticas y garantías</a>
      <a class="ml-auto hover:text-senal" href={empresa.redes.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
      <a class="hover:text-senal" href={empresa.redes.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 6: Enchufarlos en Base.astro**

Reemplazar el `<body>` de `src/layouts/Base.astro`:

```astro
  <body class="flex min-h-screen flex-col bg-fondo text-tinta antialiased">
    <Header />
    <main class="flex-1"><slot /></main>
    <Footer />
  </body>
```

Y añadir los imports en el frontmatter:

```ts
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
```

- [ ] **Step 7: Escribir el test del pie**

`tests/layout.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('pie de página (CRIT-04)', () => {
  const html = readFileSync('dist/index.html', 'utf-8');

  it('publica la dirección completa, no solo la ciudad', () => {
    expect(html).toContain('Carrera 87A # 32-81');
    expect(html).toContain('Laureles');
  });

  it('publica correo y horario en español, no solo en el schema', () => {
    // 'Lun a Vie: 08:00 a 18:00' solo lo produce el pie: el JSON-LD
    // mantiene los días en inglés. Aserciones como '08:00' a secas
    // pasarían aunque el bloque del pie no existiera.
    expect(html).toContain('Lun a Vie: 08:00 a 18:00');
    expect(html).toContain('Sáb: 08:00 a 12:00');
    expect(html).toContain(`mailto:${'gerencia@mipc.com.co'}`);
  });
});
```

- [ ] **Step 8: Añadir el logotipo**

Convertir el logo actual a SVG y guardarlo en `public/logo-mipc.svg`. Si no hay versión vectorial disponible, usar el PNG existente en `public/logo-mipc.png` y ajustar la etiqueta `<img>` del Header. El PNG de origen está en `https://mipc.com.co/wp-content/uploads/2023/02/Logo_MiPc_Computadores.png`.

- [ ] **Step 9: Compilar y ejecutar los tests**

Run: `npm run build && npx vitest run tests/whatsapp.test.ts tests/layout.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: header, footer con NAP completo y enlaces de WhatsApp"
```

---

### Task 8: Componentes de interfaz

**Files:**
- Create: `src/components/ui/Boton.astro`, `src/components/ui/Cifra.astro`, `src/components/ui/TarjetaServicio.astro`, `src/components/ui/CTAWhatsApp.astro`, `src/components/ui/Figura.astro`

**Interfaces:**
- Consumes: `enlaceWhatsApp()` de Task 7
- Produces: `<Boton href variante>`, `<Cifra valor etiqueta>`, `<TarjetaServicio servicio>`, `<CTAWhatsApp mensaje texto>`, `<Figura src alt {pie?}>`. Consumido por Tasks 9 a 14.

- [ ] **Step 1: Escribir Boton.astro**

```astro
---
interface Props { href: string; variante?: 'senal' | 'ancla' | 'borde'; }
const { href, variante = 'senal' } = Astro.props;
const estilos = {
  senal: 'bg-senal-fuerte text-white hover:bg-senal-oscuro',
  ancla: 'bg-ancla text-white hover:bg-ancla-oscuro',
  borde: 'border border-borde bg-superficie text-tinta hover:border-senal hover:text-senal',
};
---
<a
  href={href}
  class:list={[
    'inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold transition-colors',
    estilos[variante],
  ]}
><slot /></a>
```

- [ ] **Step 2: Escribir Cifra.astro**

```astro
---
interface Props { valor: string; etiqueta: string; }
const { valor, etiqueta } = Astro.props;
---
<div class="flex flex-col gap-1">
  <span class="cifra text-4xl font-semibold leading-none text-senal">{valor}</span>
  <span class="text-sm text-tinta-2">{etiqueta}</span>
</div>
```

- [ ] **Step 3: Escribir Figura.astro**

El `alt` es obligatorio por tipo: sin él, TypeScript falla la compilación.

```astro
---
import { Image } from 'astro:assets';
interface Props { src: ImageMetadata; alt: string; pie?: string; }
const { src, alt, pie } = Astro.props;
---
<figure class="overflow-hidden rounded-sm border border-borde bg-superficie">
  <Image {src} {alt} widths={[480, 800, 1200]} sizes="(max-width: 768px) 100vw, 50vw" class="w-full" />
  {pie && <figcaption class="px-4 py-3 text-sm text-tinta-2">{pie}</figcaption>}
</figure>
```

- [ ] **Step 4: Escribir CTAWhatsApp.astro**

```astro
---
import { enlaceWhatsApp } from '../../lib/whatsapp';
interface Props { mensaje: string; texto?: string; }
const { mensaje, texto = 'Escríbenos por WhatsApp' } = Astro.props;
---
<a
  href={enlaceWhatsApp(mensaje)}
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-2 rounded-sm bg-[#25d366] px-5 py-3 text-sm font-semibold text-[#0b3d24] transition-opacity hover:opacity-90"
>{texto}</a>
```

- [ ] **Step 5: Escribir TarjetaServicio.astro**

El filete lateral se enciende en naranja al pasar el cursor, según el spec.

```astro
---
export import type { CollectionEntry } from 'astro:content';

export interface Props {
  servicio: CollectionEntry<'servicios'>;
}
const { servicio } = Astro.props;

/**
 * Tipar la prop con CollectionEntry en vez de una forma estructural suelta
 * conecta esta etiqueta con el enum del esquema. Sin eso, añadir un cuarto
 * valor a `publico` en schemas.ts no rompería nada: saldría una etiqueta
 * vacía en silencio. Así falla la compilación, que es lo que queremos.
 */
const etiqueta: Record<CollectionEntry<'servicios'>['data']['publico'], string> = {
  empresa: 'Empresas',
  persona: 'Personas',
  ambos: 'Empresas y personas',
};
---
<a
  href={`/servicios/${servicio.id}/`}
  class="group flex flex-col gap-3 border border-borde border-l-4 border-l-borde bg-superficie p-6 transition-colors hover:border-l-senal"
>
  <span class="cifra text-xs uppercase tracking-widest text-tinta-2">
    {etiqueta[servicio.data.publico]}
  </span>
  <h3 class="text-xl font-semibold group-hover:text-senal">{servicio.data.titulo}</h3>
  <p class="text-sm text-tinta-2">{servicio.data.resumen}</p>
</a>
```

- [ ] **Step 6: Verificar que todo compila**

Run: `npm run build`
Expected: build sin errores.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: componentes de interfaz base"
```

---

### Task 9: Muro de clientes

**Files:**
- Create: `src/components/ui/MuroClientes.astro`, `src/content/clientes/*.md` (18 archivos)
- Test: `tests/clientes.test.ts`

**Interfaces:**
- Consumes: colección `clientes` de Task 5
- Produces: `<MuroClientes />`. Consumido por Tasks 10 y 12.

Retícula densa con logos a **88 px de ancho de exhibición**, que es lo que hace que los PNG de 179 px se vean nítidos en pantalla 2x. Los seis clientes sin logo van como nombre en texto en la misma retícula.

- [ ] **Step 1: Crear los archivos de clientes**

Doce con logo, seis sin él. Ejemplo con logo, `src/content/clientes/olimpica-stereo.md`:

```markdown
---
nombre: Olímpica Stereo
sector: Medios y radiodifusión
logo: /logos/olimpica-stereo.png
orden: 1
---
```

Ejemplo sin logo, `src/content/clientes/radio-tiempo.md`:

```markdown
---
nombre: Radio Tiempo
sector: Medios y radiodifusión
orden: 2
---
```

Crear los 18 con estos datos:

| Archivo | nombre | sector | logo |
|---|---|---|---|
| `olimpica-stereo.md` | Olímpica Stereo | Medios y radiodifusión | sí |
| `radio-tiempo.md` | Radio Tiempo | Medios y radiodifusión | no |
| `mix-fm.md` | Mix 89.9 FM | Medios y radiodifusión | sí |
| `la-paisana.md` | La Paisana | Medios y radiodifusión | sí |
| `trauma-centro.md` | Trauma Centro | Salud | sí |
| `ips-ser-integral.md` | IPS Ser Integral | Salud | sí |
| `quirovida.md` | QuiroVida | Salud | no |
| `ie-el-pedregal.md` | I. E. El Pedregal | Educación | sí |
| `ie-progresar.md` | I. E. Progresar | Educación | sí |
| `etdh-pedro-justo-berrio.md` | ETDH Pedro Justo Berrío | Educación | no |
| `eip-sas.md` | E.I.P. S.A.S. Estructuras | Ingeniería y construcción | sí |
| `ingenieria-y-contratos.md` | Ingeniería & Contratos S.A.S. | Ingeniería y construcción | sí |
| `gaf.md` | GAF Gerencia Administrativa y Financiera | Servicios profesionales | sí |
| `meper-solutions.md` | Meper Solutions | Servicios profesionales | sí |
| `seiso.md` | Grupo Empresarial Seiso | Servicios profesionales | no |
| `vanex.md` | Vanex International | Industria | no |
| `lrm.md` | LRM | Industria | no |
| `distribuidora-fp.md` | Distribuidora FP | Comercio | sí |

Copiar los 12 PNG descargados a `public/logos/` con los nombres de la columna correspondiente.

- [ ] **Step 2: Escribir el test**

`tests/clientes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('muro de clientes', () => {
  const doc = parse(readFileSync('dist/index.html', 'utf-8'));

  it('muestra los 18 clientes', () => {
    expect(doc.querySelectorAll('[data-cliente]')).toHaveLength(18);
  });

  it('TODOS los logos se exhiben a 88px, no solo el primero', () => {
    const imgs = doc.querySelectorAll('[data-cliente] img');
    expect(imgs).toHaveLength(12);
    expect(imgs.every((i) => i.getAttribute('width') === '88')).toBe(true);
    expect(imgs.every((i) => i.getAttribute('height') === '52')).toBe(true);
  });

  it('cada alt nombra a su cliente, no es texto de relleno', () => {
    // Comprobar solo la longitud dejaría pasar un alt genérico repetido.
    const imgs = doc.querySelectorAll('[data-cliente] img');
    for (const img of imgs) {
      const alt = img.getAttribute('alt') ?? '';
      const src = img.getAttribute('src') ?? '';
      const slug = src.split('/').pop()!.replace('.png', '');
      const primeraPalabra = slug.split('-')[0];
      expect(alt.toLowerCase()).toContain(primeraPalabra.toLowerCase());
      expect(alt).not.toContain('.png');
    }
  });

  it('las primeras marcas no van diferidas: el muro está arriba de la página', () => {
    const imgs = doc.querySelectorAll('[data-cliente] img');
    expect(imgs.slice(0, 6).every((i) => i.getAttribute('loading') === 'eager')).toBe(true);
  });
});
```

- [ ] **Step 3: Ejecutar para verificar que falla**

Run: `npm run build && npx vitest run tests/clientes.test.ts`
Expected: FAIL — no hay elementos `[data-cliente]`.

- [ ] **Step 4: Escribir MuroClientes.astro**

```astro
---
import { getCollection } from 'astro:content';
const clientes = (await getCollection('clientes')).sort((a, b) => a.data.orden - b.data.orden);

/**
 * Las primeras seis IMÁGENES visibles van eager, no los primeros seis
 * clientes de la lista: los que no tienen logo se intercalan entre ellos,
 * así que indexar por posición en `clientes` deja menos de seis imágenes
 * eager en cuanto hay un cliente sin logo en medio.
 */
const idsEager = new Set(
  clientes.filter((c) => c.data.logo).slice(0, 6).map((c) => c.id)
);
---
<section class="border-y border-borde bg-superficie py-14">
  <div class="mx-auto max-w-6xl px-5">
    <h2 class="text-2xl font-semibold">Confían en nosotros</h2>
    <p class="mt-2 max-w-prose text-sm text-tinta-2">
      Emisoras, IPS, instituciones educativas y firmas de ingeniería del área metropolitana
      de Medellín.
    </p>

    <ul class="mt-8 grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] items-center gap-x-8 gap-y-7">
      {clientes.map((c) => (
        <li data-cliente class="flex items-center justify-center" title={c.data.sector}>
          {c.data.logo ? (
            <img
              src={c.data.logo}
              alt={`Logotipo de ${c.data.nombre}, cliente de MiPC Tecnología`}
              width="88"
              height="52"
              loading={idsEager.has(c.id) ? 'eager' : 'lazy'}
              decoding="async"
              class="h-auto w-[88px] grayscale transition hover:grayscale-0"
            />
          ) : (
            <span class="text-center text-xs font-semibold leading-tight text-tinta-2">
              {c.data.nombre}
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 5: Incluirlo provisionalmente en la home y compilar**

Añadir `<MuroClientes />` dentro de `<Base>` en `src/pages/index.astro`, con su import.

Run: `npm run build && npx vitest run tests/clientes.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: muro de clientes con retícula densa a 88px"
```

---

### Task 10: Las cinco páginas de servicio

**Files:**
- Create: `src/content/servicios/*.md` (5), `src/pages/servicios/[slug].astro`, `src/pages/servicios/index.astro`, `src/layouts/Servicio.astro`
- Test: `tests/servicios.test.ts`

**Interfaces:**
- Consumes: colección `servicios` de Task 5, `service()` y `breadcrumb()` de Task 3, `<Base>` de Task 4
- Produces: 5 URLs `/servicios/<slug>/` y el hub `/servicios/`

Corrige CONT-03 (cinco servicios en una sola URL) y CONT-01 (el texto de alquiler era el de redes).

- [ ] **Step 1: Escribir el contenido del servicio insignia**

`src/content/servicios/soporte-ti-empresarial.md`:

```markdown
---
titulo: Soporte TI Empresarial
h1: Soporte TI empresarial en Medellín
metaTitle: Soporte TI Empresarial en Medellín | MiPC Tecnología
metaDescription: Mesa de ayuda, soporte remoto y en sitio para empresas en Medellín. Más de 15 años atendiendo emisoras, IPS e instituciones educativas.
resumen: Mesa de ayuda, soporte remoto y en sitio para que tu operación no se detenga.
publico: empresa
orden: 1
beneficios:
  - Soporte remoto y en sitio en el área metropolitana
  - Escalamiento y seguimiento de incidentes hasta su cierre
  - Inventario y control de equipos
  - Trabajo en alturas con arnés y equipo de protección
faq:
  - pregunta: ¿Atienden fuera de Medellín?
    respuesta: Sí. Cubrimos Envigado, Sabaneta, Itagüí, Bello y La Estrella, además de Medellín.
  - pregunta: ¿Trabajan por contrato mensual?
    respuesta: Sí. La mayoría de nuestros clientes corporativos trabaja con acuerdos mensuales que incluyen mantenimiento preventivo, soporte y atención de incidentes.
---

Cuando un computador falla en una empresa no se detiene una persona: se detiene un
proceso. Una emisora que no puede salir al aire, una IPS que no puede atender una cita,
un colegio que no puede tomar asistencia.

Desde 2009 atendemos la infraestructura tecnológica de organizaciones del área
metropolitana de Medellín. Damos soporte de software, hardware y ofimática, atendemos
incidentes del usuario final y hacemos mantenimiento preventivo para que la falla no
llegue a ocurrir.

## Cómo trabajamos

Recibimos el incidente por WhatsApp, teléfono o correo. Lo que se puede resolver en
remoto se resuelve en remoto; lo que exige presencia, se atiende en sitio. Cada caso se
sigue hasta el cierre, no hasta la primera respuesta.
```

- [ ] **Step 2: Escribir los otros cuatro servicios**

`src/content/servicios/reparacion-de-computadores.md`:

```markdown
---
titulo: Reparación de Computadores
h1: Reparación de computadores en Medellín
metaTitle: Reparación de Computadores en Medellín | MiPC Tecnología
metaDescription: "Reparación y mantenimiento de computadores en Medellín: pantallas, discos, formateo, virus y rescate de información. Atendemos personas y empresas."
resumen: Reparación y mantenimiento preventivo y correctivo, para personas y empresas.
publico: ambos
orden: 2
beneficios:
  - Cambio de pantallas y discos duros
  - Eliminación de virus y reinstalación de sistema operativo
  - Rescate de información
  - Mantenimiento preventivo por contrato para empresas
faq:
  - pregunta: ¿Puedo recuperar la información de un disco dañado?
    respuesta: En la mayoría de los casos sí. El diagnóstico determina si la falla es lógica o física y qué porcentaje de la información es recuperable.
---

Reparamos computadores de escritorio y portátiles: pantallas rotas, discos que fallan,
equipos lentos, infecciones por virus, sistemas operativos que no arrancan y rescate de
información.

Para empresas ofrecemos mantenimiento preventivo programado, que es lo que evita que un
equipo crítico falle en el peor momento.
```

`src/content/servicios/camaras-de-seguridad.md`:

```markdown
---
titulo: Cámaras de Seguridad
h1: Cámaras de seguridad y control de acceso en Medellín
metaTitle: Cámaras de Seguridad y CCTV en Medellín | MiPC Tecnología
metaDescription: Instalación y mantenimiento de CCTV, alarmas y control de acceso para empresas en Medellín. Trabajo en alturas con arnés y equipo de protección.
resumen: Instalación y mantenimiento de CCTV, alarmas y control de acceso.
publico: empresa
orden: 3
beneficios:
  - Diseño e instalación de circuito cerrado de televisión
  - Alarmas y control de acceso
  - Mantenimiento preventivo de los sistemas instalados
  - Trabajo en alturas con arnés y equipo de protección
faq:
  - pregunta: ¿Hacen mantenimiento de cámaras que instaló otro proveedor?
    respuesta: Sí. Hacemos diagnóstico del sistema existente y proponemos el mantenimiento o las mejoras necesarias.
---

Instalamos y mantenemos sistemas de videovigilancia, alarmas y control de acceso para
establecimientos comerciales, instituciones educativas y sedes empresariales.

El trabajo en fachadas y postes se ejecuta con arnés, casco y equipo de protección.
Para un cliente institucional eso no es un detalle estético: es parte del cumplimiento
que le van a auditar.
```

`src/content/servicios/redes-de-datos.md`:

```markdown
---
titulo: Redes de Datos
h1: Redes de datos y cableado estructurado en Medellín
metaTitle: Redes de Datos y Cableado en Medellín | MiPC Tecnología
metaDescription: Diseño, instalación y administración de redes de datos y eléctricas para empresas en Medellín. Cableado estructurado documentado e identificado.
resumen: Diseño, instalación y administración de redes de datos y eléctricas.
publico: empresa
orden: 4
beneficios:
  - Cableado estructurado y puntos de red
  - Configuración y administración de equipos activos
  - Redes eléctricas reguladas
  - Documentación e identificación de cada punto
faq:
  - pregunta: ¿Entregan documentación de la red?
    respuesta: Sí. Cada instalación se entrega con el diagrama y la identificación de los puntos, para que cualquier técnico pueda intervenirla después.
---

Diseñamos, instalamos y administramos redes de datos y eléctricas. Desde el punto de red
de una oficina nueva hasta el cableado estructurado de una sede completa.

Cada instalación se documenta e identifica. Una red sin documentar es una red que solo
puede mantener quien la hizo, y eso es exactamente el problema que resolvemos.
```

`src/content/servicios/alquiler-de-computadores.md`:

```markdown
---
titulo: Alquiler de Computadores
h1: Alquiler de computadores para empresas en Medellín
metaTitle: Alquiler de Computadores en Medellín | MiPC Tecnología
metaDescription: Alquiler de computadores y portátiles por contrato en Medellín, con soporte técnico, mantenimiento periódico y reposición de equipos incluida.
resumen: Equipos por contrato, con soporte, mantenimiento y reposición incluidos.
publico: empresa
orden: 5
beneficios:
  - Equipos de escritorio y portátiles por contrato
  - Soporte técnico y mantenimiento periódico incluidos
  - Reposición en caso de falla
  - Entrega y recogida en sitio
faq:
  - pregunta: ¿Cuál es el plazo mínimo de alquiler?
    respuesta: Trabajamos desde proyectos cortos hasta contratos anuales. El plazo y la cantidad de equipos determinan la tarifa.
  - pregunta: ¿Qué pasa si un equipo alquilado falla?
    respuesta: La reposición está incluida en el contrato. El objetivo es que la operación no se detenga.
---

Alquilamos computadores de escritorio y portátiles por contrato, con soporte técnico,
mantenimiento periódico y reposición incluidos.

Sirve para crecimientos temporales de personal, proyectos con fecha de cierre, o para
evitar inmovilizar capital en equipos que se deprecian. Nosotros nos ocupamos del
mantenimiento y de la reposición si algo falla.
```

- [ ] **Step 3: Escribir el test**

`tests/servicios.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

const slugs = [
  'soporte-ti-empresarial', 'reparacion-de-computadores', 'camaras-de-seguridad',
  'redes-de-datos', 'alquiler-de-computadores',
];

describe('páginas de servicio', () => {
  it('cada servicio tiene su propia URL', () => {
    for (const s of slugs) {
      expect(existsSync(`dist/servicios/${s}/index.html`)).toBe(true);
    }
  });

  it('cada una tiene exactamente una h1 con la ciudad', () => {
    for (const s of slugs) {
      const doc = parse(readFileSync(`dist/servicios/${s}/index.html`, 'utf-8'));
      const h1 = doc.querySelectorAll('h1');
      expect(h1).toHaveLength(1);
      expect(h1[0].text).toContain('Medellín');
    }
  });

  it('cada una emite JSON-LD de tipo Service', () => {
    for (const s of slugs) {
      const doc = parse(readFileSync(`dist/servicios/${s}/index.html`, 'utf-8'));
      const tipos = doc
        .querySelectorAll('script[type="application/ld+json"]')
        .map((b) => JSON.parse(b.text)['@type']);
      expect(tipos).toContain('Service');
    }
  });

  it('alquiler habla de alquiler y no de redes (CONT-01)', () => {
    const html = readFileSync('dist/servicios/alquiler-de-computadores/index.html', 'utf-8');
    expect(html).toContain('por contrato');
    expect(html).not.toContain('administración de redes de datos y eléctricas');
  });
});
```

- [ ] **Step 4: Ejecutar para verificar que falla**

Run: `npm run build && npx vitest run tests/servicios.test.ts`
Expected: FAIL — las rutas no existen.

- [ ] **Step 5: Escribir el layout de servicio**

`src/layouts/Servicio.astro`:

```astro
---
import Base from './Base.astro';
import Boton from '../components/ui/Boton.astro';
import CTAWhatsApp from '../components/ui/CTAWhatsApp.astro';
import type { CollectionEntry } from 'astro:content';
import { service, breadcrumb } from '../lib/jsonld';

/** Derivado de la colección, no una forma suelta: si el esquema cambia, esto rompe. */
type FAQ = CollectionEntry<'servicios'>['data']['faq'][number];

const { entrada } = Astro.props;
const d = entrada.data;
const url = new URL(Astro.url.pathname, Astro.site).href;

const jsonld = [
  service({ nombre: d.titulo, descripcion: d.metaDescription, url }),
  breadcrumb([
    { nombre: 'Inicio', url: new URL('/', Astro.site).href },
    { nombre: 'Servicios', url: new URL('/servicios/', Astro.site).href },
    { nombre: d.titulo, url },
  ]),
  ...(d.faq.length
    ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: d.faq.map((f: FAQ) => ({
          '@type': 'Question',
          name: f.pregunta,
          acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
        })),
      }]
    : []),
];
---
<Base title={d.metaTitle} metaDescription={d.metaDescription} {jsonld}>
  <article class="mx-auto max-w-3xl px-5 py-16">
    <nav aria-label="Ruta" class="cifra text-xs uppercase tracking-widest text-tinta-2">
      <a href="/" class="hover:text-senal">Inicio</a> /
      <a href="/servicios/" class="hover:text-senal">Servicios</a> / {d.titulo}
    </nav>

    <h1 class="mt-4 text-4xl font-semibold">{d.h1}</h1>
    <p class="mt-4 text-lg text-tinta-2">{d.resumen}</p>

    <div class="mt-8 flex flex-wrap gap-3">
      <Boton href="/contacto/">Solicitar cotización</Boton>
      <CTAWhatsApp mensaje={`Hola, me interesa el servicio de ${d.titulo}`} />
    </div>

    {d.beneficios.length > 0 && (
      <ul class="mt-12 grid gap-3 sm:grid-cols-2">
        {d.beneficios.map((b: string) => (
          <li class="border border-borde border-l-4 border-l-senal bg-superficie p-4 text-sm">{b}</li>
        ))}
      </ul>
    )}

    <div class="prose prose-neutral mt-12 max-w-none"><slot /></div>

    {d.faq.length > 0 && (
      <section class="mt-14">
        <h2 class="text-2xl font-semibold">Preguntas frecuentes</h2>
        <dl class="mt-6 space-y-6">
          {d.faq.map((f: FAQ) => (
            <div class="border-t border-borde pt-4">
              <dt class="font-semibold">{f.pregunta}</dt>
              <dd class="mt-2 text-tinta-2">{f.respuesta}</dd>
            </div>
          ))}
        </dl>
      </section>
    )}
  </article>
</Base>
```

- [ ] **Step 6: Escribir la ruta dinámica**

`src/pages/servicios/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import Servicio from '../../layouts/Servicio.astro';

export async function getStaticPaths() {
  const servicios = await getCollection('servicios');
  return servicios.map((entrada) => ({ params: { slug: entrada.id }, props: { entrada } }));
}

const { entrada } = Astro.props;
const { Content } = await render(entrada);
---
<Servicio {entrada}><Content /></Servicio>
```

- [ ] **Step 7: Escribir el hub de servicios**

`src/pages/servicios/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import TarjetaServicio from '../../components/ui/TarjetaServicio.astro';

const servicios = (await getCollection('servicios')).sort((a, b) => a.data.orden - b.data.orden);
---
<Base
  title="Servicios de Tecnología en Medellín | MiPC Tecnología"
  metaDescription="Soporte TI, reparación de computadores, cámaras de seguridad, redes de datos y alquiler de equipos para empresas del área metropolitana de Medellín."
>
  <div class="mx-auto max-w-6xl px-5 py-16">
    <h1 class="text-4xl font-semibold">Servicios</h1>
    <p class="mt-4 max-w-prose text-lg text-tinta-2">
      Cinco líneas de servicio para mantener la operación tecnológica de tu empresa
      funcionando, desde el equipo del usuario final hasta la infraestructura de red.
    </p>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {servicios.map((s) => <TarjetaServicio servicio={s} />)}
    </div>
  </div>
</Base>
```

- [ ] **Step 8: Compilar y ejecutar el test**

Run: `npm run build && npx vitest run tests/servicios.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: cinco páginas de servicio con schema y FAQ"
```

---

### Task 11: Home reenfocada a B2B

**Files:**
- Modify: `src/pages/index.astro`
- Test: `tests/home.test.ts`

**Interfaces:**
- Consumes: `<MuroClientes>` de Task 9, `<TarjetaServicio>` de Task 8, colección `servicios`
- Produces: la home

El hero deja de ser una foto genérica y pasa a ser el argumento en cifras. El muro de clientes sube al primer tercio.

- [ ] **Step 1: Escribir el test**

`tests/home.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('home', () => {
  const raw = readFileSync('dist/index.html', 'utf-8');
  const doc = parse(raw);

  it('tiene exactamente una h1 (SEO-01)', () => {
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
  });

  it('el mensaje principal es empresarial, no de reparación a domicilio', () => {
    expect(doc.querySelector('h1')!.text.toLowerCase()).toContain('empresa');
  });

  it('el muro de clientes va antes que el blog', () => {
    const muro = raw.indexOf('Confían en nosotros');
    const blog = raw.indexOf('Actualidad');
    // Sin estas dos precondiciones el test pasa cuando el muro DESAPARECE:
    // indexOf devuelve -1 y -1 es menor que cualquier posición. Es decir,
    // pasaría exactamente en la regresión que existe para detectar.
    expect(muro).toBeGreaterThan(-1);
    expect(blog).toBeGreaterThan(-1);
    expect(muro).toBeLessThan(blog);
  });

  it('ofrece las dos rutas de público', () => {
    expect(raw).toContain('Soy empresa');
    expect(raw).toContain('Soy persona');
  });
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `npm run build && npx vitest run tests/home.test.ts`
Expected: FAIL.

- [ ] **Step 3: Escribir la home**

`src/pages/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import MuroClientes from '../components/ui/MuroClientes.astro';
import TarjetaServicio from '../components/ui/TarjetaServicio.astro';
import Boton from '../components/ui/Boton.astro';
import Cifra from '../components/ui/Cifra.astro';
import { empresa } from '../data/empresa';

const servicios = (await getCollection('servicios')).sort((a, b) => a.data.orden - b.data.orden);
const anios = new Date().getFullYear() - empresa.fundacion;
const entradas = (await getCollection('blog'))
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime())
  .slice(0, 3);
---
<Base
  title="Soporte TI Empresarial en Medellín | MiPC Tecnología"
  metaDescription="Soporte TI, redes de datos, CCTV y alquiler de equipos para empresas en Medellín. Más de 15 años atendiendo emisoras, IPS e instituciones educativas."
>
  <section class="border-b border-borde bg-superficie">
    <div class="mx-auto max-w-6xl px-5 py-20">
      <p class="cifra text-xs uppercase tracking-widest text-senal">
        Medellín y área metropolitana
      </p>
      <h1 class="mt-4 max-w-3xl text-5xl font-semibold leading-[1.08]">
        La tecnología de tu empresa, funcionando todos los días
      </h1>
      <p class="mt-6 max-w-2xl text-lg text-tinta-2">
        Soporte TI, redes de datos, cámaras de seguridad y alquiler de equipos para
        organizaciones que no se pueden dar el lujo de parar.
      </p>

      <div class="mt-10 flex flex-wrap gap-3">
        <Boton href="/servicios/">Soy empresa</Boton>
        <Boton href="/servicios/reparacion-de-computadores/" variante="borde">Soy persona</Boton>
      </div>

      <div class="mt-16 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-3">
        <Cifra valor={`${anios}+`} etiqueta="años de experiencia" />
        <Cifra valor="18" etiqueta="empresas atendidas" />
        <Cifra valor="6" etiqueta="municipios cubiertos" />
      </div>
    </div>
  </section>

  <MuroClientes />

  <section class="mx-auto max-w-6xl px-5 py-16">
    <h2 class="text-3xl font-semibold">Qué hacemos</h2>
    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {servicios.map((s) => <TarjetaServicio servicio={s} />)}
    </div>
  </section>

  {entradas.length > 0 && (
  <section class="mx-auto max-w-6xl px-5 pb-20">
    <h2 class="text-3xl font-semibold">Actualidad</h2>
    <ul class="mt-8 grid gap-6 sm:grid-cols-3">
      {entradas.map((e) => (
        <li class="border border-borde bg-superficie p-6">
          <a href={`/blog/${e.id}/`} class="font-semibold hover:text-senal">{e.data.titulo}</a>
          <p class="mt-2 text-sm text-tinta-2">{e.data.resumen}</p>
        </li>
      ))}
    </ul>
  </section>
  )}
</Base>
```

- [ ] **Step 4: Compilar y ejecutar el test**

Run: `npm run build && npx vitest run tests/home.test.ts`
Expected: PASS, 4 tests. Si el test del blog falla por no haber entradas todavía, ejecutarlo de nuevo tras la Task 14.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: home reenfocada a B2B con cifras y muro de clientes arriba"
```

---

### Task 12: Páginas de contenido estático

**Files:**
- Create: `src/pages/nosotros.astro`, `src/pages/clientes.astro`, `src/pages/recursos.astro`, `src/pages/garantias.astro`, `src/pages/404.astro`, `src/content/paginas/garantias.md`, `src/content/casos/*.md`
- Test: `tests/paginas.test.ts`

**Interfaces:**
- Consumes: colecciones `paginas` y `casos`, `<MuroClientes>`, `<Base>`
- Produces: las URLs `/nosotros/`, `/clientes/`, `/recursos/`, `/garantias/`, y la 404

`/recursos/` enlaza a las descargas oficiales de cada fabricante, no a MEGA, y no incluye Pack Office (§12 del spec).

- [ ] **Step 1: Escribir el test**

`tests/paginas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('páginas estáticas', () => {
  it('todas existen y tienen una sola h1', () => {
    for (const p of ['nosotros', 'clientes', 'recursos', 'garantias']) {
      expect(existsSync(`dist/${p}/index.html`)).toBe(true);
      const doc = parse(readFileSync(`dist/${p}/index.html`, 'utf-8'));
      expect(doc.querySelectorAll('h1')).toHaveLength(1);
    }
  });

  it('recursos no enlaza a MEGA ni ofrece Pack Office', () => {
    const html = readFileSync('dist/recursos/index.html', 'utf-8');
    expect(html).not.toContain('mega.nz');
    expect(html).not.toContain('Pack Office');
  });

  it('recursos enlaza a los sitios oficiales', () => {
    const html = readFileSync('dist/recursos/index.html', 'utf-8');
    expect(html).toContain('anydesk.com');
    expect(html).toContain('crystalmark.info');
  });

  it('la 404 ofrece salida a los servicios', () => {
    const html = readFileSync('dist/404.html', 'utf-8');
    expect(html).toContain('/servicios/');
  });
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `npm run build && npx vitest run tests/paginas.test.ts`
Expected: FAIL.

- [ ] **Step 3: Escribir /recursos/**

`src/pages/recursos.astro`:

```astro
---
import Base from '../layouts/Base.astro';

const herramientas = [
  { nombre: 'AnyDesk', descripcion: 'Para que podamos conectarnos a tu equipo y darte soporte remoto.', url: 'https://anydesk.com/es/downloads' },
  { nombre: 'DeskIn', descripcion: 'Alternativa de soporte remoto cuando AnyDesk no está disponible.', url: 'https://www.deskin.io/download' },
  { nombre: 'CrystalDiskInfo', descripcion: 'Muestra el estado de salud del disco duro de tu equipo.', url: 'https://crystalmark.info/en/software/crystaldiskinfo/' },
];
---
<Base
  title="Recursos y Herramientas de Soporte | MiPC Tecnología"
  metaDescription="Herramientas de soporte remoto y diagnóstico que usamos con nuestros clientes en Medellín, con enlaces a la descarga oficial de cada fabricante."
>
  <div class="mx-auto max-w-3xl px-5 py-16">
    <h1 class="text-4xl font-semibold">Recursos</h1>
    <p class="mt-4 text-lg text-tinta-2">
      Herramientas que usamos durante el soporte. Cada enlace lleva a la descarga oficial
      del fabricante, para que siempre obtengas la versión vigente y verificada.
    </p>

    <ul class="mt-10 space-y-4">
      {herramientas.map((h) => (
        <li class="border border-borde border-l-4 border-l-senal bg-superficie p-5">
          <a href={h.url} rel="noopener nofollow" class="font-semibold hover:text-senal">
            {h.nombre}
          </a>
          <p class="mt-1 text-sm text-tinta-2">{h.descripcion}</p>
        </li>
      ))}
    </ul>

    <section class="mt-12">
      <h2 class="text-2xl font-semibold">Consultar el identificador del equipo</h2>
      <p class="mt-3 text-tinta-2">
        Si te pedimos el identificador único de tu computador, abre el símbolo del sistema
        y copia este comando:
      </p>
      <pre class="cifra mt-4 overflow-x-auto border border-borde bg-superficie p-4 text-sm"><code>wmic csproduct get UUID</code></pre>
    </section>
  </div>
</Base>
```

- [ ] **Step 4: Escribir /nosotros/**

`src/pages/nosotros.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Cifra from '../components/ui/Cifra.astro';
import Boton from '../components/ui/Boton.astro';
import { empresa } from '../data/empresa';
const anios = new Date().getFullYear() - empresa.fundacion;
---
<Base
  title="Nosotros: Empresa de Soporte TI en Medellín | MiPC Tecnología"
  metaDescription="MiPC Tecnología es una empresa colombiana fundada en 2009 en Medellín, especializada en soporte TI, redes, CCTV y alquiler de equipos para organizaciones."
>
  <div class="mx-auto max-w-3xl px-5 py-16">
    <h1 class="text-4xl font-semibold">Una empresa de Medellín, desde {empresa.fundacion}</h1>

    <p class="mt-6 text-lg text-tinta-2">
      MiPC Tecnología es una empresa 100% colombiana con sede en {empresa.direccion.barrio},
      Medellín. Desde {empresa.fundacion} damos soporte a la infraestructura tecnológica de
      organizaciones del sector privado y público.
    </p>

    <div class="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
      <Cifra valor={`${anios}+`} etiqueta="años de experiencia" />
      <Cifra valor="18" etiqueta="empresas atendidas" />
      <Cifra valor="5" etiqueta="líneas de servicio" />
    </div>

    <section class="mt-14">
      <h2 class="text-2xl font-semibold">Cómo trabajamos</h2>
      <p class="mt-4 text-tinta-2">
        Nuestros técnicos trabajan uniformados e identificados, y quien interviene fachadas,
        postes y techos lo hace con arnés, casco y equipo de protección. Para un cliente
        institucional eso no es un detalle estético: es parte del cumplimiento que le van a
        auditar, y preferimos que nos lo exijan.
      </p>
      <p class="mt-4 text-tinta-2">
        Cada instalación de red se entrega documentada e identificada, de modo que cualquier
        técnico pueda intervenirla después. No creemos en dejar clientes atados a su proveedor.
      </p>
    </section>

    <div class="mt-12"><Boton href="/contacto/">Hablemos de tu operación</Boton></div>
  </div>
</Base>
```

- [ ] **Step 5: Escribir los casos de éxito**

Con el permiso de nombrar clientes confirmado. `src/content/casos/olimpica-stereo.md`:

```markdown
---
cliente: Olímpica Stereo
sector: Medios y radiodifusión
reto: Una emisora no puede permitirse que un equipo de transmisión falle sin respaldo inmediato.
solucion: Mantenimiento preventivo programado de los equipos de la cabina y soporte con atención prioritaria.
resultado: Continuidad de la operación al aire, con las fallas atendidas antes de que afecten la transmisión.
orden: 1
---
```

`src/content/casos/ips-ser-integral.md`:

```markdown
---
cliente: IPS Ser Integral
sector: Salud
reto: Los equipos de consulta y facturación deben estar disponibles en todo momento de atención al paciente.
solucion: Mesa de ayuda con soporte remoto y en sitio, más mantenimiento preventivo de los equipos de consultorio.
resultado: Incidentes resueltos sin suspender la agenda de atención.
orden: 2
---
```

`src/content/casos/ie-progresar.md`:

```markdown
---
cliente: I. E. Progresar
sector: Educación
reto: Salas de cómputo y red institucional con uso intensivo y presupuesto ajustado.
solucion: Mantenimiento del parque de equipos, cableado estructurado documentado y CCTV en zonas comunes.
resultado: Salas operativas durante el año lectivo y red documentada para futuras intervenciones.
orden: 3
---
```

- [ ] **Step 6: Escribir /clientes/**

`src/pages/clientes.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import MuroClientes from '../components/ui/MuroClientes.astro';
import Boton from '../components/ui/Boton.astro';

const casos = (await getCollection('casos')).sort((a, b) => a.data.orden - b.data.orden);
---
<Base
  title="Clientes y Casos de Éxito en Medellín | MiPC Tecnología"
  metaDescription="Emisoras, IPS, instituciones educativas y firmas de ingeniería que confían su infraestructura tecnológica a MiPC Tecnología en Medellín."
>
  <div class="mx-auto max-w-6xl px-5 pt-16">
    <h1 class="text-4xl font-semibold">Clientes</h1>
    <p class="mt-4 max-w-prose text-lg text-tinta-2">
      Trabajamos con organizaciones cuya operación depende de que la tecnología no falle.
    </p>
  </div>

  <div class="mt-12"><MuroClientes /></div>

  <section class="mx-auto max-w-6xl px-5 py-16">
    <h2 class="text-3xl font-semibold">Casos</h2>
    <div class="mt-8 grid gap-6 lg:grid-cols-3">
      {casos.map((c) => (
        <article class="border border-borde bg-superficie p-6">
          <p class="cifra text-xs uppercase tracking-widest text-tinta-2">{c.data.sector}</p>
          <h3 class="mt-2 text-xl font-semibold">{c.data.cliente}</h3>
          <dl class="mt-4 space-y-3 text-sm">
            <div><dt class="font-semibold">Reto</dt><dd class="text-tinta-2">{c.data.reto}</dd></div>
            <div><dt class="font-semibold">Solución</dt><dd class="text-tinta-2">{c.data.solucion}</dd></div>
            <div><dt class="font-semibold">Resultado</dt><dd class="text-tinta-2">{c.data.resultado}</dd></div>
          </dl>
        </article>
      ))}
    </div>
    <div class="mt-10"><Boton href="/contacto/">Quiero algo así para mi empresa</Boton></div>
  </section>
</Base>
```

- [ ] **Step 7: Migrar /garantias/**

Copiar el texto de políticas y garantías desde `https://mipc.com.co/garantias/` al cuerpo de `src/content/paginas/garantias.md`, corrigiendo las tildes que falten. El frontmatter debe ser exactamente:

```markdown
---
titulo: Políticas y garantías
h1: Políticas y garantías
metaTitle: Políticas y Garantías del Servicio | MiPC Tecnología
metaDescription: Condiciones de garantía de los servicios de reparación, mantenimiento, instalación y alquiler de equipos de MiPC Tecnología en Medellín.
---

(aquí el texto migrado del sitio actual)
```

`src/pages/garantias.astro`:

```astro
---
import { getEntry, render } from 'astro:content';
import Base from '../layouts/Base.astro';

const entrada = await getEntry('paginas', 'garantias');
if (!entrada) throw new Error('Falta src/content/paginas/garantias.md');
const { Content } = await render(entrada);
const d = entrada.data;
---
<Base title={d.metaTitle} metaDescription={d.metaDescription}>
  <div class="mx-auto max-w-3xl px-5 py-16">
    <h1 class="text-4xl font-semibold">{d.h1}</h1>
    <div class="prose prose-neutral mt-8 max-w-none"><Content /></div>
  </div>
</Base>
```

- [ ] **Step 8: Escribir la 404**

`src/pages/404.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Boton from '../components/ui/Boton.astro';
import CTAWhatsApp from '../components/ui/CTAWhatsApp.astro';
---
<Base
  title="Página no encontrada | MiPC Tecnología"
  metaDescription="La página que buscas no existe o cambió de dirección. Estos son nuestros servicios de tecnología para empresas en Medellín."
>
  <div class="mx-auto max-w-3xl px-5 py-24">
    <p class="cifra text-6xl font-semibold text-senal">404</p>
    <h1 class="mt-4 text-4xl font-semibold">Esta página no existe</h1>
    <p class="mt-4 text-lg text-tinta-2">
      Puede que haya cambiado de dirección. Estos son los caminos que sí funcionan:
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <Boton href="/servicios/">Ver servicios</Boton>
      <Boton href="/contacto/" variante="borde">Contacto</Boton>
      <CTAWhatsApp mensaje="Hola, llegué a una página que no existe en el sitio y necesito ayuda" />
    </div>
  </div>
</Base>
```

- [ ] **Step 9: Compilar y ejecutar el test**

Run: `npm run build && npx vitest run tests/paginas.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: nosotros, clientes con casos, recursos sin MEGA, garantías y 404"
```

---

### Task 13: Contacto, formulario y página de gracias

**Files:**
- Create: `src/pages/contacto.astro`, `src/pages/gracias.astro`, `src/components/ui/Formulario.astro`, `.env.example`
- Test: `tests/contacto.test.ts`

**Interfaces:**
- Consumes: `empresa` de Task 2, `enlaceWhatsApp()` de Task 7
- Produces: `/contacto/` y `/gracias/`

`/gracias/` es una URL propia para poder medir la conversión en GA4, imposible hoy.

- [ ] **Step 1: Obtener la clave de Web3Forms**

Registrar `gerencia@mipc.com.co` en `https://web3forms.com/` y obtener la clave de acceso gratuita. Guardarla en `.env`:

```bash
echo 'PUBLIC_WEB3FORMS_KEY=pega-aqui-la-clave' > .env
echo 'PUBLIC_WEB3FORMS_KEY=' > .env.example
echo '.env' >> .gitignore
```

- [ ] **Step 2: Escribir el test**

`tests/contacto.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('contacto', () => {
  const doc = parse(readFileSync('dist/contacto/index.html', 'utf-8'));

  it('publica la dirección completa para el posicionamiento local', () => {
    const html = doc.toString();
    expect(html).toContain('Carrera 87A # 32-81');
  });

  it('el formulario redirige a /gracias/ para poder medir la conversión', () => {
    const redirect = doc.querySelector('input[name="redirect"]')?.getAttribute('value');
    expect(redirect).toContain('/gracias/');
  });

  it('tiene honeypot antispam oculto', () => {
    expect(doc.querySelector('input[name="botcheck"]')).toBeTruthy();
  });

  it('cada campo tiene su label asociada', () => {
    for (const id of ['nombre', 'email', 'telefono', 'mensaje']) {
      expect(doc.querySelector(`label[for="${id}"]`)).toBeTruthy();
      expect(doc.querySelector(`#${id}`)).toBeTruthy();
    }
  });
});
```

- [ ] **Step 3: Ejecutar para verificar que falla**

Run: `npm run build && npx vitest run tests/contacto.test.ts`
Expected: FAIL.

- [ ] **Step 4: Escribir el formulario**

`src/components/ui/Formulario.astro`:

```astro
---
import { empresa } from '../../data/empresa';
const clave = import.meta.env.PUBLIC_WEB3FORMS_KEY;
const gracias = new URL('/gracias/', Astro.site).href;
const campo = 'w-full rounded-sm border border-borde bg-superficie px-3 py-2 text-sm';
---
<form action="https://api.web3forms.com/submit" method="POST" class="grid gap-4">
  <input type="hidden" name="access_key" value={clave} />
  <input type="hidden" name="redirect" value={gracias} />
  <input type="hidden" name="subject" value="Nueva solicitud desde mipc.com.co" />
  <input type="hidden" name="from_name" value={empresa.nombre} />
  <input type="checkbox" name="botcheck" class="hidden" style="display:none" tabindex="-1" autocomplete="off" />

  <div>
    <label for="nombre" class="text-sm font-semibold">Nombre</label>
    <input id="nombre" name="nombre" type="text" required class={`mt-1 ${campo}`} />
  </div>
  <div>
    <label for="email" class="text-sm font-semibold">Correo</label>
    <input id="email" name="email" type="email" required class={`mt-1 ${campo}`} />
  </div>
  <div>
    <label for="telefono" class="text-sm font-semibold">Teléfono</label>
    <input id="telefono" name="telefono" type="tel" required class={`mt-1 cifra ${campo}`} />
  </div>
  <div>
    <label for="mensaje" class="text-sm font-semibold">¿Qué necesitas?</label>
    <textarea id="mensaje" name="mensaje" rows="5" required class={`mt-1 ${campo}`}></textarea>
  </div>

  <button type="submit" class="rounded-sm bg-senal-fuerte px-5 py-3 text-sm font-semibold text-white hover:bg-senal-oscuro">
    Enviar solicitud
  </button>
</form>
```

- [ ] **Step 5: Escribir /contacto/ y /gracias/**

`src/pages/contacto.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Formulario from '../components/ui/Formulario.astro';
import CTAWhatsApp from '../components/ui/CTAWhatsApp.astro';
import { empresa } from '../data/empresa';

// Misma traducción que el pie: el dato guarda los valores de schema.org.
const dias: Record<string, string> = {
  Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié',
  Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom',
};
---
<Base
  title="Contacto: Soporte TI en Medellín | MiPC Tecnología"
  metaDescription="Escríbenos para cotizar soporte TI, redes, cámaras de seguridad o alquiler de equipos en Medellín. Atención por WhatsApp, teléfono y correo."
>
  <div class="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
    <div>
      <h1 class="text-4xl font-semibold">Hablemos</h1>
      <p class="mt-4 text-lg text-tinta-2">
        Cuéntanos qué necesitas y te respondemos con una propuesta concreta.
      </p>

      <dl class="mt-10 space-y-5 text-sm">
        <div>
          <dt class="font-semibold">Dirección</dt>
          <dd class="text-tinta-2">
            {empresa.direccion.calle}<br />
            {empresa.direccion.barrio}, {empresa.direccion.ciudad}, {empresa.direccion.departamento}
          </dd>
        </div>
        <div>
          <dt class="font-semibold">Teléfono</dt>
          <dd><a class="cifra text-tinta-2 hover:text-senal" href={`tel:${empresa.telefonoE164}`}>{empresa.telefono}</a></dd>
        </div>
        <div>
          <dt class="font-semibold">Correo</dt>
          <dd><a class="text-tinta-2 hover:text-senal" href={`mailto:${empresa.email}`}>{empresa.email}</a></dd>
        </div>
        <div>
          <dt class="font-semibold">Horario</dt>
          <dd class="text-tinta-2">
            {empresa.horario.map((h) => (
              <span class="cifra block">
                {dias[h.dias[0]]}{h.dias.length > 1 ? ` a ${dias[h.dias[h.dias.length - 1]]}` : ''}: {h.abre} a {h.cierra}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt class="font-semibold">Cobertura</dt>
          <dd class="text-tinta-2">{empresa.zonaServicio.join(' · ')}</dd>
        </div>
      </dl>

      <div class="mt-8">
        <CTAWhatsApp mensaje="Hola, quiero cotizar un servicio para mi empresa" />
      </div>
    </div>

    <div class="border border-borde bg-superficie p-6">
      <h2 class="text-xl font-semibold">Solicita tu cotización</h2>
      <div class="mt-6"><Formulario /></div>
    </div>
  </div>
</Base>
```

`src/pages/gracias.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Boton from '../components/ui/Boton.astro';
---
<Base
  title="Solicitud recibida | MiPC Tecnología"
  metaDescription="Recibimos tu solicitud de cotización. Te responderemos en el transcurso del siguiente día hábil desde MiPC Tecnología en Medellín."
>
  <div class="mx-auto max-w-2xl px-5 py-24">
    <h1 class="text-4xl font-semibold">Recibimos tu solicitud</h1>
    <p class="mt-4 text-lg text-tinta-2">
      Te respondemos en el transcurso del siguiente día hábil. Si necesitas atención
      inmediata, escríbenos por WhatsApp.
    </p>
    <div class="mt-8"><Boton href="/servicios/">Ver los servicios</Boton></div>
  </div>
</Base>
```

- [ ] **Step 6: Compilar y ejecutar el test**

Run: `npm run build && npx vitest run tests/contacto.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 7: Probar el envío real**

Enviar el formulario desde `npm run preview` y confirmar que el correo llega a `gerencia@mipc.com.co` y que el navegador aterriza en `/gracias/`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: contacto con NAP completo, formulario Web3Forms y página de gracias"
```

---

### Task 14: Blog

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/layouts/Entrada.astro`, `src/content/blog/*.md` (3)
- Test: `tests/blog.test.ts`

**Interfaces:**
- Consumes: colección `blog` de Task 5, `article()` y `breadcrumb()` de Task 3
- Produces: `/blog/` y `/blog/<slug>/`

Las tres entradas viejas de 2023 no se migran: se redirigen a `/blog/` en Task 15. Estas tres son propias y sobre lo que la empresa vende.

- [ ] **Step 1: Escribir las tres entradas**

`src/content/blog/mantenimiento-preventivo-empresas.md`:

```markdown
---
titulo: Cada cuánto hacer mantenimiento preventivo a los computadores de una empresa
metaTitle: Mantenimiento Preventivo de Computadores | MiPC Tecnología
metaDescription: Cada cuánto hacer mantenimiento preventivo a los equipos de tu empresa, qué incluye y cómo calcular si te sale más barato que reparar cuando falla.
fecha: 2026-08-14
resumen: La frecuencia depende del ambiente, no del calendario. Cómo definirla para tu operación.
---

La respuesta corta es dos veces al año. La respuesta útil es que depende del ambiente
donde trabaja el equipo.

Un computador en una oficina con aire acondicionado acumula polvo mucho más despacio que
uno en una bodega, un taller o una cabina de radio. Hemos abierto equipos de un año con
el disipador completamente tapado, y equipos de cuatro años impecables.

## Qué incluye un mantenimiento preventivo real

Limpieza interna y del sistema de disipación, cambio de pasta térmica cuando corresponde,
revisión del estado de salud del disco, verificación de temperaturas bajo carga y
actualización del sistema operativo y del antivirus.

Lo importante es el diagnóstico del disco: es el componente que falla con más frecuencia
y el único cuya falla se lleva la información.
```

`src/content/blog/alquilar-o-comprar-computadores.md`:

```markdown
---
titulo: Alquilar o comprar computadores para tu empresa
metaTitle: ¿Alquilar o Comprar Computadores? | MiPC Tecnología
metaDescription: Cuándo conviene alquilar computadores para tu empresa y cuándo comprarlos, considerando depreciación, mantenimiento, reposición y flujo de caja.
fecha: 2026-08-07
resumen: No es una cuestión de precio total, sino de flujo de caja y de quién asume la falla.
---

La comparación que suele hacerse es el costo del alquiler durante tres años contra el
precio de compra. Casi siempre gana la compra, y casi siempre esa cuenta está incompleta.

Falta lo que pasa cuando un equipo falla, quién lo repara, cuánto tiempo está la persona
sin trabajar y qué se hace con el equipo cuando ya no sirve.

## Cuándo conviene alquilar

Cuando el crecimiento de personal es temporal, cuando el proyecto tiene fecha de cierre,
cuando no quieres inmovilizar capital en un activo que se deprecia rápido, o cuando no
tienes un área de TI que se ocupe del mantenimiento y la reposición.

## Cuándo conviene comprar

Cuando el equipo es estable en el tiempo, cuando hay quien lo mantenga y cuando la
inversión inicial no compromete el flujo de caja.
```

`src/content/blog/camaras-seguridad-que-preguntar.md`:

```markdown
---
titulo: Qué preguntarle a quien te instala las cámaras de seguridad
metaTitle: Qué Preguntar al Instalar Cámaras CCTV | MiPC Tecnología
metaDescription: "Las preguntas que debes hacerle a un instalador de CCTV antes de contratar: certificación de alturas, documentación, garantía y quién puede mantener el sistema."
fecha: 2026-07-31
resumen: Cuatro preguntas que separan a un instalador serio de uno que te deja atado.
---

Un sistema de cámaras mal instalado no se nota el primer día. Se nota cuando hay que
revisar una grabación y no está, o cuando se daña y nadie más puede intervenirlo.

## Las cuatro preguntas

**¿El personal tiene certificación de trabajo en alturas?** Si van a intervenir fachadas,
postes o techos, es un requisito legal, no una preferencia. Pídelo por escrito.

**¿Me entregan la documentación del sistema?** Diagrama, ubicación de cada cámara,
credenciales del grabador. Sin eso quedas atado a quien lo instaló.

**¿Qué cubre la garantía y por cuánto tiempo?** Distingue entre garantía del equipo, que
es del fabricante, y garantía de la instalación, que es del instalador.

**¿Quién puede darle mantenimiento después?** Si la respuesta es «solo nosotros», eso no
es un servicio: es una dependencia.
```

- [ ] **Step 2: Escribir el test**

`tests/blog.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

describe('blog', () => {
  it('el índice existe y lista las entradas', () => {
    expect(existsSync('dist/blog/index.html')).toBe(true);
    const doc = parse(readFileSync('dist/blog/index.html', 'utf-8'));
    expect(doc.querySelectorAll('article').length).toBeGreaterThanOrEqual(3);
  });

  it('cada entrada emite JSON-LD de tipo Article', () => {
    const doc = parse(readFileSync('dist/blog/mantenimiento-preventivo-empresas/index.html', 'utf-8'));
    const tipos = doc
      .querySelectorAll('script[type="application/ld+json"]')
      .map((b) => JSON.parse(b.text)['@type']);
    expect(tipos).toContain('Article');
  });

  it('las fechas se muestran en español, no en inglés', () => {
    const html = readFileSync('dist/blog/index.html', 'utf-8');
    expect(html).not.toMatch(/January|April|August/);
  });
});
```

- [ ] **Step 3: Ejecutar para verificar que falla**

Run: `npm run build && npx vitest run tests/blog.test.ts`
Expected: FAIL.

- [ ] **Step 4: Escribir el layout de entrada**

`src/layouts/Entrada.astro`:

```astro
---
import Base from './Base.astro';
import { article, breadcrumb } from '../lib/jsonld';

const { entrada } = Astro.props;
const d = entrada.data;
const url = new URL(Astro.url.pathname, Astro.site).href;
const fecha = d.fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

const jsonld = [
  article({ titulo: d.titulo, descripcion: d.metaDescription, url, fecha: d.fecha }),
  breadcrumb([
    { nombre: 'Inicio', url: new URL('/', Astro.site).href },
    { nombre: 'Blog', url: new URL('/blog/', Astro.site).href },
    { nombre: d.titulo, url },
  ]),
];
---
<Base title={d.metaTitle} metaDescription={d.metaDescription} {jsonld}>
  <article class="mx-auto max-w-2xl px-5 py-16">
    <time datetime={d.fecha.toISOString()} class="cifra text-xs uppercase tracking-widest text-tinta-2">
      {fecha}
    </time>
    <h1 class="mt-3 text-4xl font-semibold">{d.titulo}</h1>
    <div class="prose prose-neutral mt-8 max-w-none"><slot /></div>
  </article>
</Base>
```

- [ ] **Step 5: Escribir las rutas**

`src/pages/blog/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import Entrada from '../../layouts/Entrada.astro';

export async function getStaticPaths() {
  const entradas = await getCollection('blog');
  return entradas.map((entrada) => ({ params: { slug: entrada.id }, props: { entrada } }));
}

const { entrada } = Astro.props;
const { Content } = await render(entrada);
---
<Entrada {entrada}><Content /></Entrada>
```

`src/pages/blog/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';

const entradas = (await getCollection('blog'))
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
---
<Base
  title="Blog sobre Tecnología para Empresas | MiPC Tecnología"
  metaDescription="Guías prácticas sobre mantenimiento de equipos, redes, cámaras de seguridad y alquiler de computadores, escritas desde la experiencia en Medellín."
>
  <div class="mx-auto max-w-3xl px-5 py-16">
    <h1 class="text-4xl font-semibold">Actualidad</h1>
    <div class="mt-10 space-y-8">
      {entradas.map((e) => (
        <article class="border-t border-borde pt-6">
          <time datetime={e.data.fecha.toISOString()} class="cifra text-xs uppercase tracking-widest text-tinta-2">
            {e.data.fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
          <h2 class="mt-2 text-2xl font-semibold">
            <a href={`/blog/${e.id}/`} class="hover:text-senal">{e.data.titulo}</a>
          </h2>
          <p class="mt-2 text-tinta-2">{e.data.resumen}</p>
        </article>
      ))}
    </div>
  </div>
</Base>
```

- [ ] **Step 6: Compilar y ejecutar los tests**

Run: `npm run build && npx vitest run tests/blog.test.ts tests/home.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: blog con tres entradas propias y schema Article"
```

---

### Task 15: Redirecciones 301

**Files:**
- Create: `src/data/redirecciones.ts`, `scripts/generar-redirecciones.mjs`, `scripts/check-redirecciones.mjs`
- Modify: `package.json`
- Test: `tests/redirecciones.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `redirecciones: Array<{de: string; a: string}>`; el archivo `public/_redirects` para Cloudflare Pages

Esta tarea preserva el posicionamiento acumulado. Sin ella, cada URL vieja indexada devuelve 404.

- [ ] **Step 1: Escribir el test**

`tests/redirecciones.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { redirecciones } from '../src/data/redirecciones';

describe('mapa de redirecciones', () => {
  const destinos = new Map(redirecciones.map((r) => [r.de, r.a]));

  it('cubre todas las URLs del sitio de WordPress', () => {
    for (const vieja of [
      '/home/servicios/',
      '/home/servicios-mipc-tecnologia-copy/',
      '/home/experiencia/',
      '/home/actualidad/',
      '/home/contacto/',
      '/category/uncategorized/',
      '/author/santiago-martinezmipc-com-co/',
    ]) {
      expect(destinos.has(vieja)).toBe(true);
    }
  });

  it('la página "copy" apunta a nosotros', () => {
    expect(destinos.get('/home/servicios-mipc-tecnologia-copy/')).toBe('/nosotros/');
  });

  it('las tres entradas de 2023 van al blog', () => {
    expect(destinos.get('/intel-anuncia-nuevos-procesadores-de-escritorio-core-de-12a-generacion/')).toBe('/blog/');
  });

  it('ningún destino es a su vez origen de otra redirección (sin cadenas)', () => {
    for (const r of redirecciones) {
      expect(destinos.has(r.a)).toBe(false);
    }
  });

  it('no hay orígenes duplicados', () => {
    expect(new Set(redirecciones.map((r) => r.de)).size).toBe(redirecciones.length);
  });
});
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `npx vitest run tests/redirecciones.test.ts`
Expected: FAIL — no se puede resolver el módulo.

- [ ] **Step 3: Escribir el mapa**

`src/data/redirecciones.ts`:

```ts
/** Mapa de URLs de WordPress a las nuevas. Fuente de public/_redirects. */
export const redirecciones: Array<{ de: string; a: string }> = [
  { de: '/home/servicios/', a: '/servicios/' },
  { de: '/home/servicios-mipc-tecnologia-copy/', a: '/nosotros/' },
  { de: '/servicios-mipc-tecnologia/', a: '/nosotros/' },
  { de: '/home/experiencia/', a: '/clientes/' },
  { de: '/home/actualidad/', a: '/blog/' },
  { de: '/home/contacto/', a: '/contacto/' },
  { de: '/home/', a: '/' },

  { de: '/intel-anuncia-nuevos-procesadores-de-escritorio-core-de-12a-generacion/', a: '/blog/' },
  { de: '/amazon-anuncia-la-adquisicion-de-la-empresa-de-tecnologia-cuantica-psiquantum/', a: '/blog/' },
  { de: '/google-anuncia-actualizaciones-de-sus-productos-de-realidad-virtual-y-aumentada/', a: '/blog/' },

  { de: '/category/uncategorized/', a: '/blog/' },
  { de: '/author/santiago-martinezmipc-com-co/', a: '/' },
  { de: '/wp-sitemap.xml', a: '/sitemap-index.xml' },
  { de: '/feed/', a: '/blog/' },
];
```

- [ ] **Step 4: Escribir el generador**

`scripts/generar-redirecciones.mjs`:

```js
import { writeFileSync } from 'node:fs';
import { redirecciones } from '../src/data/redirecciones.ts';

const lineas = redirecciones.map((r) => `${r.de} ${r.a} 301`);
writeFileSync('public/_redirects', lineas.join('\n') + '\n');
console.log(`_redirects generado con ${lineas.length} reglas`);
```

Como el script importa TypeScript, ejecutarlo con el intérprete de tipos de Node:

```json
"prebuild": "node --experimental-strip-types scripts/generar-redirecciones.mjs"
```

Añadir ese `prebuild` al bloque `scripts` de `package.json`, de modo que `_redirects` se regenere en cada compilación y no pueda quedar desactualizado.

- [ ] **Step 5: Escribir el verificador post-corte**

`scripts/check-redirecciones.mjs`:

```js
import { redirecciones } from '../src/data/redirecciones.ts';

const base = process.argv[2] ?? 'https://mipc.com.co';
let fallos = 0;

for (const r of redirecciones) {
  const res = await fetch(base + r.de, { redirect: 'manual' });
  const destino = res.headers.get('location') ?? '';
  const ok = res.status === 301 && destino.endsWith(r.a);
  if (!ok) {
    fallos++;
    console.error(`FALLA ${r.de} -> esperaba 301 a ${r.a}, obtuvo ${res.status} ${destino}`);
  }
}

console.log(fallos === 0
  ? `Las ${redirecciones.length} redirecciones responden correctamente`
  : `${fallos} redirecciones fallan`);
process.exit(fallos === 0 ? 0 : 1);
```

- [ ] **Step 6: Ejecutar los tests y generar**

Run: `npx vitest run tests/redirecciones.test.ts && npm run build && cat public/_redirects`
Expected: PASS 5 tests, y `public/_redirects` con 14 reglas.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: mapa de redirecciones 301 y verificador post-corte"
```

---

### Task 16: Controles de calidad que rompen el build

**Files:**
- Create: `scripts/check-html.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `dist/` compilado
- Produces: comando `npm run check:html`, que sale con código 1 si algo falla

Esta es la tarea que convierte los hallazgos de la auditoría en imposibles. El enlace roto del CTA lleva años en producción porque nada lo vigilaba.

- [ ] **Step 1: Escribir el verificador de HTML**

`scripts/check-html.mjs`:

```js
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { parse } from 'node-html-parser';

const paginas = globSync('dist/**/*.html');
const fallos = [];

for (const ruta of paginas) {
  const doc = parse(readFileSync(ruta, 'utf-8'));
  const en = (msg) => fallos.push(`${ruta}: ${msg}`);

  // SEO-01: una y solo una h1
  const h1 = doc.querySelectorAll('h1');
  if (h1.length !== 1) en(`tiene ${h1.length} etiquetas h1, debe tener exactamente 1`);

  // SEO-02: meta description presente y útil
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  if (desc.length < 70) en(`meta description ausente o demasiado corta (${desc.length} caracteres)`);
  if (desc.length > 165) en(`meta description demasiado larga (${desc.length} caracteres)`);

  // CRIT-05: idioma correcto
  const lang = doc.querySelector('html')?.getAttribute('lang');
  if (lang !== 'es-CO') en(`lang es "${lang}", debe ser "es-CO"`);

  // SEO-03: el title no puede terminar en el dominio
  const title = doc.querySelector('title')?.text ?? '';
  if (title.includes('mipc.com.co')) en('el title contiene el dominio en vez de la marca');
  if (!title.endsWith('| MiPC Tecnología')) en(`el title no termina en la marca: "${title}"`);
  // Las páginas que pasan `title` como prop no atraviesan el esquema Zod,
  // así que el límite de longitud solo existe aquí para ellas.
  if (title.length > 65) en(`title de ${title.length} caracteres, Google lo truncará: "${title}"`);

  // SEO-07: alt en toda imagen
  for (const img of doc.querySelectorAll('img')) {
    const alt = img.getAttribute('alt');
    if (!alt || alt.trim().length < 5) en(`imagen sin alt útil: ${img.getAttribute('src')}`);
    if (alt && /\.(png|jpe?g|webp|svg)$/i.test(alt)) en(`el alt es el nombre del archivo: ${alt}`);
  }

  // Canonical absoluta
  const canon = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
  if (!canon.startsWith('https://mipc.com.co/')) en(`canonical ausente o relativa: "${canon}"`);
}

if (fallos.length) {
  console.error(`\n${fallos.length} problemas de calidad en el HTML:\n`);
  for (const f of fallos) console.error('  ' + f);
  process.exit(1);
}
console.log(`${paginas.length} páginas verificadas, sin problemas`);
```

- [ ] **Step 2: Ejecutar el verificador**

Run: `npm run build && npm run check:html`
Expected: PASS. Si señala fallos, corregirlos — son fallos reales del contenido, no del verificador.

- [ ] **Step 3: Ejecutar el verificador de enlaces**

Run: `npm run check:links`
Expected: sin enlaces rotos. Este es el control que habría atrapado CRIT-01 y CRIT-06.

- [ ] **Step 4: Ejecutar la verificación completa**

Run: `npm run verify`
Expected: `astro check`, build, tests, HTML y enlaces, todo en verde.

- [ ] **Step 5: Añadir integración continua**

`.github/workflows/verificar.yml`:

```yaml
name: Verificar
on: [push, pull_request]
jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run verify
        env:
          PUBLIC_WEB3FORMS_KEY: ${{ secrets.PUBLIC_WEB3FORMS_KEY }}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: controles de calidad que rompen el build ante fallos de la auditoría"
```

---

### Task 17: Imágenes, despliegue y corte de dominio

**Files:**
- Create: `src/assets/fotos/` (12 imágenes), `public/robots.txt`
- Modify: las páginas que reciben fotografía

**Interfaces:**
- Consumes: todo lo anterior
- Produces: el sitio desplegado y el dominio apuntando

- [ ] **Step 1: Incorporar las 12 fotos seleccionadas**

Descargar de `Images.txt` y guardarlas en `src/assets/fotos/` con nombres descriptivos:

| Origen | Nombre nuevo |
|---|---|
| foto 15 | `tecnico-poste-arnes.jpg` |
| foto 19 | `tecnico-control-acceso.jpg` |
| foto 02 | `tecnico-uniformado-taller.jpg` |
| foto 01 | `tecnico-instalacion-pantalla.jpg` |
| foto 20 | `equipo-fachada-alturas.jpg` |
| foto 21 | `equipo-escalera-alturas.jpg` |
| foto 18 | `tecnico-poste-alto.jpg` |
| foto 14 | `tecnico-cableado-exterior.jpg` |
| foto 11 | `tecnico-canaleta-techo.jpg` |
| foto 16 | `instalacion-techo-interior.jpg` |
| foto 17 | `equipo-red-gabinete.jpg` (recortar el collage a la mitad superior) |
| foto 06 | `placa-madre-detalle.jpg` |

Usarlas con `<Figura>` en las páginas de servicio correspondientes, cada una con un `alt` que describa la escena. Ejemplo para la página de cámaras:

```astro
---
import Figura from '../components/ui/Figura.astro';
import foto from '../assets/fotos/equipo-fachada-alturas.jpg';
---
<Figura
  src={foto}
  alt="Dos técnicos de MiPC Tecnología con arnés de seguridad instalan cableado en la fachada de una edificación industrial"
  pie="Trabajo en alturas con arnés y equipo de protección"
/>
```

- [ ] **Step 2: Aplicar la gradación de color unificada**

Añadir a `global.css` la clase que empuja las fotos hacia el azul petróleo y baja la saturación, según el spec:

```css
.foto-tratada {
  filter: saturate(0.82) contrast(1.04);
}
```

Aplicarla en `Figura.astro` sobre el `<Image>`.

- [ ] **Step 3: Crear robots.txt**

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://mipc.com.co/sitemap-index.xml
```

- [ ] **Step 4: Desplegar en Cloudflare Pages con noindex**

Crear el proyecto en Cloudflare Pages conectado al repositorio. Comando de build `npm run build`, directorio de salida `dist`. Añadir la variable `PUBLIC_WEB3FORMS_KEY`.

Mientras el sitio viva en `pages.dev`, impedir su indexación añadiendo a `public/_headers`:

```
https://:proyecto.pages.dev/*
  X-Robots-Tag: noindex
```

- [ ] **Step 5: Revisar en pages.dev**

Verificar en móvil real que no hay desbordamiento horizontal (CRIT-02), que el formulario envía, que WhatsApp abre con el mensaje precargado y que los enlaces de servicio llevan a su página (CRIT-01).

- [ ] **Step 6: Lista de verificación previa al corte**

- [ ] Horario confirmado con el cliente y **coincidente con Google Business Profile**
- [ ] Google Business Profile creado con la dirección de Laureles
- [ ] Search Console verificado por registro DNS TXT, con línea base acumulada
- [ ] GA4 instalado y registrando `/gracias/` como conversión
- [ ] `npm run verify` en verde
- [ ] Inventario de las URLs actuales guardado
- [ ] TTL del DNS bajado a 300 s, 24–48 h antes

- [ ] **Step 7: Ejecutar el corte**

Apuntar el DNS de `mipc.com.co` a Cloudflare Pages. Retirar el `noindex`. **No borrar el WordPress**: dejarlo apagado y recuperable 60 días.

- [ ] **Step 8: Verificar las redirecciones en producción**

Run: `node --experimental-strip-types scripts/check-redirecciones.mjs https://mipc.com.co`
Expected: las 14 redirecciones responden 301 al destino correcto.

- [ ] **Step 9: Enviar el sitemap y arrancar la vigilancia**

Enviar `https://mipc.com.co/sitemap-index.xml` en Search Console e inspeccionar las páginas clave para forzar el rastreo. Vigilar cuatro semanas contra la línea base. Umbral de alarma: caída de impresiones superior al 20% sostenida dos semanas.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: fotografía tratada, robots.txt y configuración de despliegue"
```

---

## Autorrevisión del plan

**Cobertura del spec.** Cada sección tiene tarea asignada: §4 URLs → Tasks 10 a 15; §5 sistema visual → Tasks 6 a 8; §6 fotografía y logos → Tasks 9 y 17; §7 arquitectura técnica → Tasks 1 a 5; §8 pruebas → Task 16; §9 despliegue y corte → Task 17; §12 Pack Office y nombres de clientes → Tasks 12 y 9.

**Riesgos conocidos, con su salida.**

- `node --experimental-strip-types` importando `.ts` desde `.mjs` (Tasks 15 y 17) depende de la versión de Node. Si falla en Node 22, la salida es convertir `redirecciones.ts` a `.mjs` con `export const redirecciones = [...]` e importarlo desde `content.config.ts`. El mapa sigue siendo una sola fuente de verdad.
- `globSync` desde `node:fs` (Task 16) requiere Node 22 o superior. Si no está disponible, sustituir por el paquete `tinyglobby`.
- Sätteri, el nuevo procesador Markdown por defecto de Astro 7, es la incógnita mayor. Si el Markdown de Tasks 10, 12 y 14 no renderiza como se espera, la salida documentada en el spec es instalar `@astrojs/markdown-remark`.
- Las clases `prose` de Tailwind usadas en Tasks 10, 12 y 14 requieren `@tailwindcss/typography`. Instalarlo en Task 10 con `npm install -D @tailwindcss/typography` y añadir `@plugin "@tailwindcss/typography";` a `global.css`.

**Correcciones aplicadas en esta autorrevisión.**

1. Los esquemas Zod se movieron de `content.config.ts` a `src/schemas.ts`. `content.config.ts` importa de `astro:content`, un módulo virtual que solo existe dentro del build, así que Vitest no podía resolverlo y el test de la Task 5 habría fallado con un error de importación imposible de diagnosticar desde el propio test.
2. La Task 1 listaba `vitest.config.ts` entre sus archivos pero ningún paso lo creaba. Añadido con su contenido.
3. La Task 12 describía la página de garantías en prosa en lugar de darle código. Añadidos el frontmatter y `garantias.astro` completos.
4. `<Cifra>` renderiza un `<div>` y estaba envuelto en `<dl>` en la home y en nosotros, lo que produce HTML inválido. Cambiado a `<div>` en ambas. Importa especialmente en Astro 7, cuyo compilador es más estricto con el HTML.
