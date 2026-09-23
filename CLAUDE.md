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
node scripts/gsc.mjs propiedades   # Search Console por API, sin dependencias
node scripts/ga4.mjs asistentes    # GA4 por API: tráfico de asistentes de IA
node scripts/indexnow.mjs          # avisa a Bing de lo publicado — DESPUÉS de desplegar
```

`gsc.mjs` y `ga4.mjs` comparten las MISMAS credenciales de cuenta de servicio,
en `~/.config/mipc/gsc.json` (o `$GSC_CREDENCIALES`), nunca dentro del
repositorio. **Empezar siempre por `gsc.mjs dias`**: un pico anómalo distorsiona
todos los promedios y en un total mensual no se ve.

**Antes de citar cualquier cifra global de GA4, descontar el tráfico directo.**
Son 1.618 sesiones de 250 usuarios, el 94% de la propiedad, con media de 2,3
segundos y el 90% entrando por `/`. **No son bots**: el pico horario está entre
las 7 y las 9 de la mañana y de madrugada no hay casi nada. Son los equipos de
clientes que llevan el sitio puesto como página de inicio del navegador. Gente
real que no decidió visitar. Falsean todo promedio del sitio. Ver
`pagina-de-inicio-en-equipos-de-clientes.md`.

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
- `medicion-search-console-2026-09-19.md` — primera lectura de orgánico tras el
  corte, y la línea base contra la que comparar.
- `planificador-palabras-clave-medellin.md` — **el techo del canal pagado,
  medido**. Léelo antes de proponer cualquier cosa sobre Google Ads.
- `campana-reparacion-especificacion.md` — la campaña, lista para montar y
  **nunca lanzada**. Lleva su propia corrección al principio.
- `medicion-ga4-pagina-de-inicio.md` — cómo mide GA4 y el asunto de
  `mipctecnologia.com`.
- `medicion-ga4-asistentes-ia-2026-09-19.md` — el canal de los asistentes de IA,
  medido. Y el hallazgo que obliga a releer toda cifra de GA4: el tráfico
  directo no es tráfico.
- `bing-e-indexnow-2026-09-19.md` — por qué Bing importa aunque su tráfico no,
  qué se verificó allí y cómo funciona `indexnow.mjs`. Incluye por qué «cero
  citaciones de IA» no dice lo que parece, y el cierre del asunto de las URL de
  spam del WordPress comprometido: **no están indexadas y no hay que
  redirigirlas**.
- `pagina-de-inicio-en-equipos-de-clientes.md` — si la práctica de dejar el
  sitio como página de inicio al formatear sirve o no. Respuesta corta: como
  recuerdo de marca sí, como canal no, y cuesta la medición del negocio.
- `revision-legal-garantias.md` — **abierto**. El articulado de `/garantias/` es
  una adaptación de un texto mexicano; «días naturales» está exento del test de
  español porque cambiarlo altera un plazo legal. Lo decide un abogado.

Varios de estos documentos llevan una corrección al principio que **contradice
su propio cuerpo**. No es descuido: el cuerpo se conserva como registro de lo
que se creyó, y la corrección manda. Leer siempre el aviso de arriba antes que
el contenido.

## Estado a 2026-09-19

Cerrado: corte de dominio (17/17 redirecciones en 301), medición de
conversiones instrumentada, huecos de schema, FAQ a 5 o más por servicio
(reparación tiene 13), línea base de Search Console registrada.

### Vivo y roto ahora mismo

*(Nada urgente. Lo que estaba aquí se arregló el fin de semana del 2026-09-20;
el resto pasó a «Pendiente».)*

### Pendiente

- **`mipctecnologia.com` redirige, pero con `302` y solo la raíz.** Es la página
  de inicio de cientos de equipos de clientes, puesta ahí al formatear durante
  años. **Lo grave ya se arregló**: hasta el 2026-09-19 respondía `302` a
  `https://app.mipc.com.co`, que era `NXDOMAIN`, y esos clientes veían una
  pantalla de error con la marca de MiPC encima cada mañana. Comprobado el
  2026-09-21, ahora lleva a `https://mipc.com.co` y carga.

  Queda lo menor, en este orden de importancia:
  1. Es `302`, temporal. Para el uso real —abrir el navegador— da igual; para
     traspasar cualquier señal del dominio viejo hace falta `301`.
  2. Solo redirige la raíz. `mipctecnologia.com/contacto/` sigue dando `404`.

  **El dominio no lo administra MiPC: lo organiza su dueño** (confirmado el
  2026-09-19), así que ni el arreglo ni su fecha dependen de este equipo. Lo
  que sí depende de aquí es comprobarlo, porque nadie avisa:

  ```bash
  curl -sIL https://mipctecnologia.com/ | grep -iE "^HTTP|^location"
  ```

- **Las impresiones de orgánico cayeron un 85% hacia el 2026-09-11 y eso NO es
  una caída.** De ~2.000 diarias a ~250. Se fueron dos consultas en inglés
  —`laptop repair` y `computer repair`— que sumaban el 97% de las impresiones y
  **nunca dieron un solo clic**. En el mismo salto, las consultas con datos
  pasaron de 67 a 103, los clics de 1 a 4 y la marca `mipc` de 0 clics a 3. El
  ruido se fue y la señal mejoró. No abrir una investigación por esto.

- **La campaña de reparación NO se puede lanzar, y no es un trámite pendiente.**
  El anuncio está rechazado por «Third Party Consumer Technical Support», que
  exige una certificación previa. El 2026-09-23 se comprobó en la cuenta que
  **esa categoría no aparece en la lista de certificaciones solicitables**: no
  hay formulario, ni apelación, ni texto que mandar a soporte. La verificación
  de anunciante sí se completó el 2026-09-22 y **no desbloquea esto**.
  Antes de volver a proponer nada sobre reparación pagada, leer el cierre de
  `ads-anuncio-rechazado-2026-09-19.md`. La pauta se mueve a las líneas B2B,
  empezando por cámaras de seguridad. Gasto acumulado: COP 0.
- **Nadie ha comprobado que las conversiones lleguen a Ads.** Toda la Prioridad
  1 del diagnóstico se construyó para eso. Que la etiqueta cargue y que la
  conversión se registre son cosas distintas.
- **Se está perdiendo la consulta de marca**: `mipc` en posición 6,2. Hay cinco
  resultados por delante para el propio nombre, coherente con las entidades
  homónimas que documenta `empresa.ts`. Sigue sin haber **ninguna reseña**
  citada pese a la ficha verificada; es la palanca más barata que queda.
- **Consultas objetivo en posición 13–22.** El contenido las puso en el tablero,
  pero página 2 no recibe clics. Si no se mueven con más texto, el problema es
  autoridad, no extensión.
- **Blog y proyectos son invisibles** (57 y 20 impresiones, cero clics). Tres
  entradas siguen en ~130 palabras de cuerpo frente al objetivo de 1.200.
- **Dos servicios por debajo del objetivo de 700–900 palabras de cuerpo**:
  `alquiler-de-computadores` (461) y `camaras-de-seguridad` (599). Medir el
  cuerpo sin frontmatter —`awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' archivo.md | wc -w`—
  porque el conteo del archivo entero incluye las FAQ y casi lo duplica.
- **Páginas por municipio: sigue sin decidirse.** Search Console da cero
  impresiones para Envigado, Sabaneta, Itagüí, Bello y La Estrella, pero eso
  significa «no tenemos visibilidad ahí», **no** «no hay demanda»: solo informa
  de consultas en las que el sitio apareció. El Planificador midió **solo
  Medellín**, así que tampoco lo responde. Lo que sí aporta es contexto en
  contra: si toda la intención de servicio en Medellín son 1.500–3.000 búsquedas
  al mes, en municipios mucho más pequeños queda poco que capturar.
- **Imágenes de proyecto sin comprimir** — 3,6 MB, con un WebP de 616 KB.
- **Core Web Vitals nunca medidos con datos de campo.**

### Dos cosas que no hay que volver a suponer

- **Google Ads no puede llenar el taller.** El mercado medido da 8–15 equipos al
  mes, un 7–15% de la capacidad de dos técnicos. Es un complemento. Cualquier
  plan que dependa de que la pauta llene la capacidad ociosa está mal fundado.
- **Los «+70 clientes» no son una base de contactos.** Son las empresas
  atendidas desde 2009 y con la mayoría ya no hay relación. Un documento de
  estrategia supuso lo contrario y construyó sobre eso su recomendación
  principal, que era inejecutable.

### Irrecuperable

**No se sabrá si la migración conservó el posicionamiento del WordPress.** La
propiedad de Search Console se creó el 2026-08-13, tres días antes del corte, y
el WordPress nunca estuvo conectado. La señal de fallo nº 1 del diagnóstico es
inevaluable; las otras tres siguen en pie. Para la próxima migración: dar de
alta la propiedad es trabajo **previo** al corte.
