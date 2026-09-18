# MiPC Tecnología — sitio en mipc.com.co

Sitio estático en **Astro + Tailwind 4**, desplegado en **Cloudflare Workers**.
Reemplazó a un WordPress el 2026-08-16; el corte de dominio ya está hecho y
verificado. Es la landing comercial de una empresa de servicios de TI en
Medellín: reparación de computadores, soporte TI, redes, CCTV, alquiler de
equipos e instalaciones eléctricas.

**El objetivo del sitio es captar clientes por orgánico y por Google Ads.** Casi
toda decisión rara que encuentres aquí se explica por eso. Antes de cambiar algo
que te parezca innecesariamente complicado, lee el comentario que lo acompaña:
en este repositorio los comentarios llevan fecha y medición detrás.

## Comandos

```bash
npm run dev        # servidor local
npm run verify     # astro check + build + tests + HTML + enlaces — ANTES DE COMMITEAR
npm test           # solo vitest (131 tests)
npm run build      # incluye scripts/check-html.mjs
```

Verificaciones contra producción, no contra el build:

```bash
node --experimental-strip-types scripts/check-redirecciones.mjs https://mipc.com.co
node scripts/check-dns.mjs
```

Node 22 (`.nvmrc`). CI corre `npm run verify` en cada push (`.github/workflows/verificar.yml`).

## Reglas que no se rompen

Estas no son preferencias de estilo. Cada una está respaldada por un test y por
un incidente real documentado en el código.

1. **El NAP se lee de `src/data/empresa.ts`, siempre.** Ninguna plantilla
   escribe teléfono, dirección, correo ni horario a mano. Cambiar un dato ahí lo
   cambia en el pie, en `/contacto/`, en el JSON-LD y en los enlaces de WhatsApp
   a la vez.

2. **El sitio y la ficha de Google Business deben decir lo mismo.** Horario,
   coordenadas y código postal salen del pin de la ficha
   (CID `15154712519055002689`), no de un callejero ni de una estimación. Una
   discrepancia entre schema y ficha resta posicionamiento local. Si el pin se
   mueve, `empresa.ts` se mueve.

3. **No inventar datos.** Si un dato no está confirmado, se omite. `geo` se
   omite entero si `coordenadas` es `null`, y eso es preferible a publicar una
   coordenada estimada. Los proyectos de `src/content/proyectos/` sustituyeron a
   tres «casos de éxito» que eran narrativas verosímiles pero inventadas sobre
   clientes reales: cada campo del esquema tiene que poder señalarse en una
   fotografía o en un registro.

4. **REGLA DE ORO de medición: sin `PUBLIC_GA4_ID` ni `PUBLIC_GOOGLE_ADS_ID`, el
   sitio no emite una sola línea de Google** — ni script, ni `dataLayer`, ni
   banner de cookies, ni eventos. La condición se lee **solo** desde
   `src/lib/medicion.ts` (`hayMedicion`); no la repitas con un `Boolean(import.meta.env…)`
   en un componente nuevo. `tests/analitica.test.ts` lo comprueba contra el
   build real.

5. **Español de Colombia.** `tests/espanol-colombia.test.ts` recorre todo `src/`
   — Markdown, `.astro` y `.ts` — y rechaza «ordenador», «nave industrial»,
   «móvil», «fichero», «vosotros», «días naturales» y otros giros de España o
   México. Recorre todo el árbol porque «nave industrial» ya sobrevivió a una
   corrección escondido en los pies de foto de `src/data/*.ts`, y lo encontró el
   cliente en su celular.

6. **Nada de comentarios HTML en la salida.** Un comentario HTML viaja íntegro a
   cada visitante y un rastreador de IA lo lee como texto de la página. Una
   integración de `astro.config.mjs` los quita del build y `check-html.mjs`
   comprueba que no quedó ninguno. En plantillas `.astro` usa la forma JSX
   (`{/* … */}`), que Astro no emite.

7. **El `noindex` de `public/_headers` está acotado POR HOST y debe seguir
   estándolo.** Mantiene fuera del índice el subdominio de pruebas. Si alguien
   lo generaliza a `/*` «para simplificar», producción desaparece de Google sin
   dar ningún error.

## Dónde vive cada cosa

| Qué | Dónde | Nota |
|---|---|---|
| NAP, horario, NIT, redes, ficha | `src/data/empresa.ts` | fuente única de verdad |
| Esquemas Zod del contenido | `src/schemas.ts` | validan SEO en tiempo de build |
| JSON-LD | `src/lib/jsonld.ts` | `localBusiness`, `service`, `breadcrumb`, `article` |
| Config de medición | `src/lib/medicion.ts` | único lector de las variables |
| Redirecciones del WordPress viejo | `src/data/redirecciones.ts` | se emiten a `dist/_redirects` |
| Fotos de proyectos y servicios | `src/data/fotos-*.ts` | **no** en el frontmatter |
| Logotipos de clientes | `src/data/logos-clientes.ts` | **no** en el frontmatter |

**Por qué las imágenes no van en el frontmatter:** `astro:assets` necesita una
importación real para optimizar, y una ruta en texto plano dentro del YAML no se
importa. Mientras el campo `logo` fue una cadena, los veinte logotipos se
sirvieron crudos desde `public/`: 248 KB de PNG, casi un tercio del peso de la
portada.

## Contenido

Cinco colecciones en `src/content/`: `servicios`, `proyectos`, `clientes`,
`blog`, `paginas`. Los esquemas de `src/schemas.ts` imponen en tiempo de build:

- `metaTitle`: 20–65 caracteres, termina en `| MiPC Tecnología`, sin el dominio.
- `metaDescription`: 70–165 caracteres.
- `alt` de imagen: mínimo 10 caracteres y no puede ser un nombre de archivo.
- Un proyecto necesita `reto`, `solucion` y `resultado` con longitud mínima, y
  al menos un servicio asociado que exista de verdad.
- Una entrada de blog puede declarar `servicio:` para enlazar a la página que
  convierte. Es opcional a propósito —forzarlo produciría enlaces falsos— pero
  el blog existe para llevar tráfico a los servicios.

Al escribir contenido nuevo: el sitio le habla a dos públicos distintos
(`publico: empresa | persona | ambos`). Reparación es de particulares; redes,
CCTV y soporte son B2B. No mezclar el tono: el botón flotante de WhatsApp llegó a
decirle «para mi empresa» a un particular con el computador dañado, y por eso
existe `mensajeWhatsApp` en el esquema.

## Medición y despliegue

- Variables en `.env.example`. Todas son `PUBLIC_`: acaban en el HTML, ninguna es
  secreta. `PUBLIC_WEB3FORMS_KEY` es obligatoria **en la plataforma de
  despliegue**: allí el build falla a propósito si falta, porque el formulario
  aceptaría envíos y los perdería en silencio. En local y en CI el build sigue
  funcionando sin ella (`enPlataformaDeDespliegue()` en
  `src/lib/despliegue.ts`), para poder revisar el sitio sin la clave real. En
  Cloudflare va en Settings → Build → Build variables, **no** en Variables &
  Secrets: esa sección es de runtime y un sitio estático la ignora.
- En producción hoy: GA4 `G-S7TNWFZT72` y Google Ads `AW-18393725809`.
- La conversión de formulario se emite en `/gracias/` solo si están las dos
  mitades del identificador de Ads. Los clics de WhatsApp y de teléfono van a
  GA4 como eventos (`clic_whatsapp`, `clic_telefono`) y se importan a Ads desde
  allí; **no** llevan `send_to`.
- `wrangler.jsonc` existe para que una URL inexistente sirva `dist/404.html`
  conservando el 404. No cambiar a `single-page-application`: devolvería 200 en
  cualquier URL y haría indexable un número infinito de páginas fantasma.

## Documentación

`docs/` distingue explícitamente lo **medido** de lo **estimado**. Lo relevante:

- `diagnostico-seo-geo-ads.md` — auditoría del 2026-08-16 con el plan de trabajo
  por prioridades. Es el mapa de lo que falta.
- `verificacion-produccion.md` — lo que se midió en vivo tras el corte.
- `despliegue-corte-dominio.md` — el procedimiento del corte.
- `revision-legal-garantias.md` — **abierto**. El articulado de `/garantias/` es
  una adaptación de un texto mexicano; «días naturales» está exento del test de
  español porque cambiarlo altera un plazo legal. Lo decide un abogado.

## Estado a 2026-09-18

Cerrado: corte de dominio (17/17 redirecciones en 301), medición de
conversiones, huecos de schema, FAQ a 5 o más por servicio (reparación tiene 13).

Pendiente, del plan de `diagnostico-seo-geo-ads.md`:

- **Dos servicios siguen por debajo del objetivo de 700–900 palabras de
  cuerpo**: `alquiler-de-computadores` (461) y `camaras-de-seguridad` (599).
  Los otros cuatro van de 803 a 1.861. Medir siempre el cuerpo sin frontmatter
  —`awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' archivo.md | wc -w`— porque el
  conteo del archivo entero incluye las FAQ y da una cifra el doble de grande.
- **Páginas por municipio** — ninguna. Se declara cobertura en seis municipios y
  «cámaras de seguridad Envigado» no tiene dónde aterrizar. Cada una debe
  anclarse a un proyecto real hecho ahí; si un municipio no tiene proyecto, no
  se le crea página.
- **Blog a medias** — tres entradas de ~815 palabras de cuerpo y tres que
  siguen en ~130. El objetivo del plan es 1.200+.
- **Sin reseñas citadas** y sin página de autor (`article()` firma como
  `Organization`). No añadir `AggregateRating` autodeclarado.
- **Imágenes de proyecto sin comprimir** — 3,6 MB, con un WebP de 616 KB.
- **Core Web Vitals nunca medidos con datos de campo.**
