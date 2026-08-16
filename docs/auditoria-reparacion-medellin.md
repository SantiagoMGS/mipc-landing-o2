# Auditoría: captar clientes de reparación de computadores en Medellín

Auditoría hecha el **2026-08-16**, a partir de las 21:10 UTC, contra el sitio
**en producción** `https://mipc.com.co/` —ya con el corte de dominio hecho, no
contra el subdominio de Workers ni contra el WordPress viejo— y contra los
sitios de cuatro competidores leídos en vivo.

Es la primera auditoría posterior al corte. Complementa
`docs/diagnostico-seo-geo-ads.md`, que se escribió contra el despliegue previo;
donde las dos digan cosas distintas, manda esta, porque mide lo que hay servido
hoy en el dominio real.

**Objetivo de negocio que ordena estas prioridades:** empezar a traer clientes
de *reparación de computadores* por orgánico y dejar el terreno listo para pagar
Google Ads. La prioridad es **reparación a particulares en Medellín**. El resto
de líneas de servicio —soporte TI empresarial, redes, CCTV, alquiler— son
secundarias *en este documento*, lo cual no dice nada sobre su peso en la
facturación.

**Este documento distingue tres cosas y no las mezcla:**

- **Medido** — hay un comando, una URL y una fecha detrás. Se puede repetir.
- **No medible desde fuera** — se dice explícitamente que no se pudo, y por qué.
  No se rellena con una suposición.
- **Estimado** — hay un razonamiento mío que nadie ha comprobado.

---

## Estado de aplicación (2026-08-16, mismo día)

Este bloque se añade después de escribir la auditoría. **El diagnóstico de
abajo queda tal como se midió, sin retocar**: sirve de registro del estado en
que se encontró el sitio. Lo que cambió es esto.

**Aplicado y verificado** (`npm run verify`: 0 errores de tipos, 32 páginas,
**109 tests**, 189 enlaces):

| § | Corrección | Dónde |
|---|---|---|
| 10.2 | El botón flotante de WhatsApp acepta mensaje por página | `src/components/ui/FlotanteWhatsApp.astro`, `src/layouts/Base.astro` |
| 10.2 | El flotante y el CTA de una página de servicio comparten mensaje | `src/layouts/Servicio.astro` |
| 10.2 | Mensaje propio para reparación, en el contenido y no en el código | `src/content/servicios/reparacion-de-computadores.md`, `src/schemas.ts` |
| 10.3 | `LocalBusiness.description` empieza por «Reparación de computadores» | `src/data/empresa.ts` |
| 10.4 | `Service.offers` con los $25.000 en COP | `src/lib/jsonld.ts`, `src/schemas.ts`, el .md de reparación |
| 10.7 | Los comentarios HTML se eliminan de la salida en el build | `astro.config.mjs` |
| 10.7 | `check-html.mjs` falla si alguno se cuela | `scripts/check-html.mjs` |
| — | Seis tests nuevos que fijan las tres correcciones anteriores | `tests/jsonld.test.ts`, `tests/servicios.test.ts` |

Verificado contra `dist/` después de construir:

```
comentarios HTML en las 32 páginas ............................ 0
LocalBusiness.description ..... «Reparación de computadores, soporte TI…»
Service.offers ................ price "25000", priceCurrency "COP"
wa.me en /servicios/reparacion-de-computadores/ ... 1 mensaje, el correcto
```

**Dos decisiones que se apartan de la letra de la auditoría, con motivo:**

1. **Los comentarios se quitan de la salida construida, no del Markdown.** El
   plan era un plugin remark, pero `markdown.remarkPlugins` exige instalar
   `@astrojs/markdown-remark`, lo que cambiaría el procesador de Markdown de
   todo el sitio (hoy Sätteri) para resolver un problema de saneamiento de
   salida. Se hace en el hook `astro:build:done`, que además cubre los dos
   orígenes —.md y .astro— en un solo sitio. Las notas siguen en el fuente,
   que es donde sirven.

2. **No se añadió `hasOfferCatalog` al `LocalBusiness`.** Exigiría que
   `jsonld.ts` conociera la colección de contenido, y esa función hoy es pura y
   se llama desde `SEO.astro` sin argumentos. Es un cambio estructural, no un
   quick win. Queda pendiente.

**Pendiente de la lista de quick wins, porque no es código:** los puntos
**10.1** (Managed robots.txt de Cloudflare), **10.5** (`301` de `www` y
`http`) y **10.6** (`mipctecnologia.com`) se hacen en el panel de Cloudflare.
El 10.6 tiene fecha: el dominio **vence el 2026-09-19**.

**Sin desplegar.** Todo lo anterior está en el árbol de trabajo, verificado
localmente. Producción sigue sirviendo la versión anterior.

---

## Relación con `verificacion-produccion.md`

**Esta auditoría se escribió sin haber leído `docs/verificacion-produccion.md`,
que estaba sin commitear en el árbol de trabajo el mismo día.** Al reconciliar
los dos documentos resultó que cuatro de los hallazgos que aquí se presentaban
como propios ya estaban medidos allí, y mejor medidos en un caso. Queda
anotado para que nadie los cuente dos veces:

| Aquí | Ya estaba en `verificacion-produccion.md` |
|---|---|
| §2, el `robots.txt` de Cloudflare | §6, con los mismos rastreadores y la misma distinción entre entrenamiento y búsqueda |
| §8, `www` responde 200 | §5.6 |
| §8, `http://` no redirige | §5.2, con el interruptor exacto del panel |
| §8, `mipctecnologia.com` en `302` | §5.7 |
| §8, «no hay datos de campo de CWV» | §5 midió **LCP de 252 ms** con emulación de dispositivo real |

**Lo que esta auditoría sí añade sobre aquella**, porque tenía otro encargo
—captar clientes de reparación, no verificar el corte de dominio—:

- El posicionamiento B2B del sitio entero contra el objetivo declarado (§3).
- La fuga del WhatsApp flotante (§3) y los comentarios HTML publicados (§7).
- La medición de profundidad de contenido página por página y contra la
  competencia (§5, §6).
- El análisis de si conviene una página de barrio (§4).
- `Service.offers` ausente (§4).
- **`app.mipc.com.co` no resuelve.** §5.7 de aquel documento dejaba abierto si
  el `302` de `mipctecnologia.com` era deliberado —«es plausible que se use
  como atajo para entrar a la aplicación»— y lo clasificaba como informativo.
  No lo es: el host de destino devuelve NXDOMAIN. No es un atajo, está roto.
- **La corrección que propone §5.6 no funcionaría.** Dice de poner el `301` de
  `www` en `public/_redirects`. Comprobado el 2026-08-16 escribiendo el
  archivo y construyendo: el hook `astro:build:done` de `astro.config.mjs`
  reescribe `dist/_redirects` entero desde `src/data/redirecciones.ts`, y la
  regla desaparece sin avisar. Ver §10 para dónde va de verdad.

**Y una corrección al revés: aquel documento tenía razón y esta auditoría se
pasó de frenada** sobre el `robots.txt` de Cloudflare. Ver el veredicto.

---

## Veredicto

> **No está listo, pero por una sola razón y no por la que se dijo primero: el
> sitio no dice que MiPC repare computadores a particulares, y la página que
> debería captarlos tiene un tercio del contenido del competidor más flaco. Lo
> primero ya está corregido; lo segundo son tres o cuatro semanas.**

### Corrección al veredicto original

La primera versión de este documento declaraba **dos** bloqueantes y ponía el
`robots.txt` de Cloudflare como el número uno. Era una exageración, y
`verificacion-produccion.md` §6 tenía la razón: los rastreadores que alimentan
las respuestas con IA en vivo —`OAI-SearchBot`, `ChatGPT-User`,
`PerplexityBot`— **no están bloqueados**, `Google-Extended` no es `Googlebot`,
y `search=yes` concede la indexación explícitamente. Nada de eso impide captar
un cliente de reparación la semana que viene.

Lo que sí sostengo, y es donde aquel documento se queda corto porque no estaba
mirando esto: con `CCBot` bloqueado y `ai-train=no` declarado, MiPC no entra en
Common Crawl, que es de donde sale buena parte de lo que un modelo «sabe» de un
negocio local sin tener que buscarlo. Eso es una limitación real para el
objetivo de GEO del §7 — pero es una limitación de largo plazo, **no un
bloqueante**, y se corrige apagando una casilla.

El bloqueante de verdad era el segundo: **el sitio estaba posicionado en
soporte TI empresarial de punta a punta** —título, H1, `description` del schema
y hasta el mensaje precargado del botón de WhatsApp— mientras el objetivo
declarado era reparación a particulares. Eso ya está corregido (ver «Estado de
aplicación»). Lo que queda es el contenido.

---

## 0. Dato nuevo aportado por Santiago (2026-08-16)

**MiPC sí hace domicilio, pero solo para recoger el equipo. La reparación se
hace en el taller de Laureles, no en casa del cliente.**

Esto es material y cambia recomendaciones, así que queda arriba y no enterrado
en una sección. Ver §2 para por qué importa tanto: los cuatro competidores que
medí construyen todo su mensaje sobre «a domicilio», y el sitio de MiPC hoy **no
menciona la palabra ni una vez**, ni para afirmarla ni para negarla.

La consecuencia estratégica es que MiPC **no debe competir en «reparación a
domicilio»** —sería prometer algo que no hace— sino en una promesa distinta que
además es más creíble:

> Recogemos el equipo donde estés, lo reparamos en el taller con banco de
> trabajo y herramienta, y te lo devolvemos.

Es defendible frente al domicilio puro: una reparación de hardware hecha en la
mesa del comedor del cliente es peor trabajo, y decirlo es un argumento de
venta, no una disculpa. Encaja con el tono que ya tiene la página («decimos el
precio porque la alternativa es peor para todos»).

**Falta confirmar con Santiago, y no lo invento:** si la recogida tiene costo,
si es gratis por encima de cierto valor de reparación, y hasta qué municipios
llega (el pie dice Medellín, Envigado, Sabaneta, Itagüí, Bello y La Estrella
para «cobertura», pero no está dicho si la recogida cubre lo mismo). Sin esos
tres datos la sección nueva de la página se queda a medias.

---

## 1. Qué se midió y qué no

### Medido directamente contra producción

Fecha y hora: **2026-08-16, 21:10–21:20 UTC**. Edge de Cloudflare que respondió:
`CF-RAY: a2c36d0abbdef498-MIA` (Miami).

| Qué | Cómo |
|---|---|
| HTML crudo de 12 URLs | `curl` directo, sin renderizado |
| `robots.txt` | `curl https://mipc.com.co/robots.txt` |
| Sitemaps | `sitemap-index.xml` → `sitemap-0.xml`, 30 URLs |
| JSON-LD | Extraído y parseado de home y página de reparación |
| Cabeceras HTTP | `curl -I` sobre apex, `www`, `http://` |
| Redirecciones | Apex, `www`, sin barra final, 404, URLs viejas de WordPress, `mipctecnologia.com` |
| Peso de recursos | `curl -w '%{size_download}'` sobre CSS, fuente, imágenes, OG |
| TTFB | `curl -w '%{time_total}'` |
| Código de consentimiento y de eventos GA4 | Leído del HTML servido |
| Conteo de palabras | Script propio: quita `<script>`, `<style>`, comentarios y etiquetas |
| Contenido de 4 competidores | Leído en vivo |

### No medible desde fuera — declarado, no supuesto

| Qué | Por qué no |
|---|---|
| **El SERP real de Medellín** | La herramienta de búsqueda geolocaliza en EEUU. Los competidores citados **existen y se leyeron**, pero **no se puede afirmar su posición** en un Google servido desde Medellín. Todo lo que se dice de ellos es sobre su *contenido*, nunca sobre su *ranking*. |
| **Core Web Vitals de campo (CrUX)** | La API de PageSpeed devolvió `429 Quota exceeded` en dos intentos (cuota compartida, sin clave propia). Sin clave de API no hay datos de campo. **Pero sí hay medición de laboratorio con emulación de dispositivo real: `verificacion-produccion.md` §5 midió LCP de 252 ms.** Ver §8. |
| **Si llegan datos reales a GA4** | Requiere autenticación en la propiedad. Lo que sí se verificó es el código que los emite (§7). |
| **Estado interno de la ficha de Google Business Profile** | El CID resuelve `200`, pero leer reseñas, categorías y fotos requiere la API. |
| **Si MiPC aparece hoy en ChatGPT / Gemini / Perplexity** | No se pueden consultar. Lo que sí se midió es si **pueden rastrear** el sitio (§5). |

---

## 2. Bloqueante 1 — Cloudflare bloquea a los rastreadores de IA

**Medido.** `public/robots.txt` en el repositorio tiene cuatro líneas limpias:

```
User-agent: *
Allow: /

Sitemap: https://mipc.com.co/sitemap-index.xml
```

Lo que sirve producción lleva delante un bloque que **no está en el repositorio**:

```
# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: Amazonbot            → Disallow: /
User-agent: Applebot-Extended    → Disallow: /
User-agent: Bytespider           → Disallow: /
User-agent: CCBot                → Disallow: /
User-agent: ClaudeBot            → Disallow: /
User-agent: Google-Extended      → Disallow: /
User-agent: GPTBot               → Disallow: /
User-agent: meta-externalagent   → Disallow: /
# END Cloudflare Managed Content
```

Es el *Managed robots.txt* / AI Crawl Control de Cloudflare, activo por defecto
en zonas nuevas. **La corrección está en el panel de Cloudflare, no en el
código.** Tocar `public/robots.txt` no sirve de nada: el bloque se antepone
igual.

### El daño, con precisión

No es catástrofe total y conviene no exagerarlo:

**Sigue pasando** (no están en la lista de bloqueo):

- `OAI-SearchBot` y `ChatGPT-User` — el índice y la navegación en vivo de
  ChatGPT.
- `PerplexityBot` y `Perplexity-User`.
- `Googlebot` — y con él los AI Overviews de Google, que **no** dependen de
  `Google-Extended`.

**Está cortado:**

- `CCBot` — Common Crawl. Es el corpus del que salen buena parte de las
  respuestas de «¿quién repara computadores en Medellín?». El más caro de los
  cuatro.
- `GPTBot` — corpus de entrenamiento de OpenAI.
- `ClaudeBot` — corpus de Anthropic.
- `Google-Extended` — grounding de Gemini y Vertex AI.
- Más la declaración explícita `ai-train=no`.

**Traducción al objetivo:** el bloqueo no impide *ranquear*. Impide **volverse
conocido** para los modelos. Para un taller local que quiere que un modelo lo
nombre por su cuenta cuando le preguntan dónde reparar un portátil en Laureles,
es exactamente el canal que hay que abrir.

**Verificación de que quedó arreglado:**

```bash
curl -sS https://mipc.com.co/robots.txt
# Debe devolver 4 líneas. Si aparece "BEGIN Cloudflare Managed content",
# la casilla del panel sigue activa.
```

---

## 3. Bloqueante 2 — El sitio no dice que repare computadores a particulares

**Medido.** Todas las señales de posicionamiento apuntan a B2B:

| Señal | Qué dice hoy |
|---|---|
| `<title>` de la home | `Soporte TI Empresarial en Medellín \| MiPC Tecnología` |
| H1 de la home | «La tecnología de **tu empresa**, funcionando todos los días» |
| Meta description de la home | «...para **empresas** en Medellín. Atendemos emisoras, IPS e instituciones educativas desde 2009.» |
| `LocalBusiness.description` en el JSON-LD | «Soporte TI empresarial, redes, CCTV y alquiler de equipos en Medellín.» — **la palabra «reparación» no aparece** |
| Botón flotante de WhatsApp **en la página de reparación** | `?text=Hola, quiero consultar por un servicio para mi empresa` |
| Menciones de «Estadio» en la home | **0** |
| Menciones de «Laureles» en la home | 2, ambas en la plantilla de cabecera y pie |

El del WhatsApp flotante es el peor de la lista. El CTA del hero de la página de
reparación **sí** tiene el texto correcto:

```
https://wa.me/573148889078?text=Hola%2C%20me%20interesa%20el%20servicio%20de%20Reparaci%C3%B3n%20de%20Computadores
```

Pero el botón flotante —el que más se toca en móvil, el que sigue al usuario
mientras baja— hereda el genérico:

```
https://wa.me/573148889078?text=Hola%2C%20quiero%20consultar%20por%20un%20servicio%20para%20mi%20empresa
```

Un particular con el portátil roto abre WhatsApp y se encuentra escrito «para mi
empresa». Es una fuga de conversión directa contra la prioridad número uno.

**Causa localizada.** `src/components/ui/FlotanteWhatsApp.astro:14`:

```astro
const mensaje = 'Hola, quiero consultar por un servicio para mi empresa';
```

Está fijo en el frontmatter del componente, no llega como `prop`. El
`enlaceWhatsApp()` de `src/lib/whatsapp.ts` ya acepta un mensaje opcional, así
que la corrección es aceptar una `prop` en el flotante y pasarle desde la
plantilla de servicio el mismo texto que ya usa el CTA del hero.

### El agravante: el WordPress viejo estaba mejor posicionado para esto

**Medido.** Buscando el negocio aparecen todavía, indexados, los títulos del
sitio anterior:

- `mipc.com.co – Tecnología, reparación de computadores`
- `Nosotros MIPC Tecnología - Reparación de Computadores`
- `Servicios MIPC Tecnología - Reparación de Computadores`

El sitio viejo llevaba «reparación de computadores» **en el título de tres
plantillas**. El nuevo lo cambió por «Soporte TI Empresarial». Se está soltando
voluntariamente la única señal histórica que el dominio tenía para el objetivo
declarado.

**Nota buena, porque el corte se hizo bien:** esas URLs viejas redirigen
correctamente. Medido:

| URL vieja | Respuesta |
|---|---|
| `/home/servicios-mipc-tecnologia-copy/` | `301` → `/nosotros/` |
| `/home/` | `301` → `/` |
| `/feed/` | `301` → `/blog/` |
| `/wp-sitemap.xml` | `301` → `/sitemap-index.xml` |
| `/wp-login.php` | `404` |
| `/?p=1` | `200`, con canonical correcto a la home |

---

## 4. SEO local: NAP, schema y la pregunta de Laureles

### NAP: consistente, verificado carácter por carácter

**Medido** entre el pie de página, `/contacto/` y el JSON-LD:

```
Carrera 66A # 34-48, Interior 101
Laureles, Medellín · Antioquia, Colombia
314 888 90 78  →  tel:+573148889078        ✓ coincide
MiPC Tecnología S.A.S. · NIT 901401211-7   ✓ visible en /contacto/ y en schema
```

El `LocalBusiness` está bien construido:

- `geo` con coordenadas (6.240407, −75.586452)
- `hasMap` con el CID **15154712519055002689** — correcto
- `openingHoursSpecification` — L–V 08:00–17:00, S 09:00–13:00
- `areaServed` con seis municipios
- `sameAs` a Facebook e Instagram
- `foundingDate` 2009
- `taxID` **y** `identifier` con `propertyID: "NIT"`

El NIT como identificador es exactamente la jugada correcta contra los
homónimos. Y hay más de los que se sabía: además de `mipc.com.mx`, buscando el
NIT apareció **`mipc-soluciones.com` — «Mi PC Soluciones IT S.A.S.»**, otro
confusable que conviene tener fichado.

### Lo que le falta al schema

| Falta | Nota |
|---|---|
| «reparación» en `LocalBusiness.description` | Ese campo es literalmente lo que un modelo lee para resumir qué es MiPC |
| `Service.offers` con los $25.000 | El precio existe en prosa pero no como dato |
| `hasOfferCatalog` en el `LocalBusiness` | Los cinco servicios como catálogo |
| `aggregateRating` | **No inventar.** Solo cuando haya reseñas propias reales que mostrar |

### Laureles/Estadio: la recomendación es NO hacer página de barrio todavía

La pregunta era si conviene una página específica de barrio o si diluye
autoridad. La respuesta es que **hoy diluye**, y la justificación es
estructural, con evidencia, no intuición.

**Evidencia a favor de hacerla, que existe y se midió:**

- `reparacionesjd.com.co/medellin/laureles/` — ~1.300 palabras, FAQ, listado de
  barrios vecinos. Una página de barrio dedicada a Laureles.
- `expertosdigitales.net/mantenimiento-de-computadores-laureles-.html` — otra.

Dos competidores ya corren páginas de barrio para Laureles. Eso es un hecho.

**Por qué aun así no conviene copiarlos:**

Hay que mirar **quiénes** son. Los dos son operadores nacionales **a domicilio,
sin dirección física en ningún lado**. Reparaciones JD tiene `/medellin/`,
`/medellin/laureles/` y equivalentes en otras ciudades. Para ellos la página de
barrio *es* la señal de proximidad, porque no tienen otra cosa que ofrecerle al
algoritmo.

MiPC tiene una dirección real en la Carrera 66A y una ficha de Google con CID.
**El algoritmo local ya le da la proximidad gratis por la ficha**, que es de
donde sale el map pack —y el map pack es el premio real para un taller físico,
no el resultado orgánico número cuatro. Duplicar esa señal en una página delgada
no añade nada y sí parte la poca autoridad que tiene un dominio recién
republicado entre dos URLs que compiten por la misma intención.

**Lo que sí hay que hacer, y ya:**

- Meter la cobertura de barrio **dentro** de la página de ciudad: una sección
  «Zonas que atendemos» nombrando Laureles, Estadio, Conquistadores,
  Suramericana, La Floresta, Bolivariana, Belén.
- Lenguaje de proximidad real: la referencia al Estadio, que hoy **no aparece
  ni una vez** en todo el sitio.
- Reforzar la ficha de Google, que es donde se juega de verdad.

**Cuándo reconsiderarlo:** cuando Search Console muestre impresiones reales para
consultas con «Laureles» y la página de ciudad ya esté ranqueando. Antes de eso
es una apuesta sin datos. Search Console todavía no existe (ver
`docs/despliegue-corte-dominio.md`), así que el dato tampoco.

---

## 5. Competencia: qué tienen que nosotros no

Se leyeron cuatro competidores en vivo. **Se repite porque importa: no se puede
confirmar su posición en el SERP servido desde Medellín.** Lo que sigue es su
contenido, medido.

| Sitio | Palabras | Precio | Garantía | FAQ | Reseñas | Eje del mensaje |
|---|---|---|---|---|---|---|
| reparaciondecomputadoresmedellin.com.co | **~2.900** | $40.000 diagnóstico | «real», sin días | 4 | 5 testimonios | **A domicilio** |
| reparacionesjd.com.co/medellin/laureles | ~1.300 | no | sin días | 4 | no | **A domicilio** + barrio |
| tirescue.com | ~1.100 | no | no | 0 | no | Taller (Guayabal) |
| expertosdigitales.net | — | no | no | — | — | **A domicilio** |
| **MiPC** | **~430** | **$25.000 abonable** | **30 días, explícita** | **5** | no | Taller |

Tres conclusiones.

### a) El eje de todos es el domicilio, y MiPC no lo menciona nunca

Ni «domicilio», ni «recogemos», ni «vamos por tu equipo». Con lo que Santiago
confirmó —recogida sí, reparación in situ no— la jugada correcta **no es**
copiar el mensaje de los competidores, sino diferenciarse de él:

> Recogemos el equipo donde estés y lo reparamos en el taller.

Y convertir la limitación en argumento: una reparación de hardware hecha en la
mesa del comedor del cliente, sin banco de trabajo ni herramienta ni repuestos a
mano, es peor trabajo. Decirlo es honesto y además vende. Es el mismo registro
que el párrafo que ya está en la página sobre por qué se dice el precio.

Palabras que hay que poner en la página y hoy no están: **recogemos ·
recogida a domicilio · pasamos por tu equipo · lo devolvemos**.

### b) MiPC es el único que dice una garantía en días

Ninguno de los cuatro pone un número. MiPC tiene **30 días** y, además, una
página `/garantias/` de **1.644 palabras de cuerpo** que la respalda —la única
página del sitio con profundidad real, y revisada legalmente según
`docs/revision-legal-garantias.md`.

Es un activo de E-E-A-T que nadie del sector tiene. Hoy vive en una frase al
final de la página de reparación.

### c) El precio es competitivo y, sobre todo, está dicho

Diagnósticos encontrados en el mercado: **$20.000**, **$40.000**, «gratis»
(varios operadores a domicilio) y una referencia genérica de **$50.000–80.000**.

Los **$25.000 abonables** de MiPC están en el lado barato del rango. Contra los
«gratis» se pierde en el titular, pero esos son operadores a domicilio que meten
el costo del diagnóstico dentro del precio de la reparación. El párrafo que ya
está escrito en la página —«la ambigüedad no protege el margen: solo hace perder
una tarde a las dos partes»— es el mejor texto del sitio y está enterrado en el
cuarto párrafo.

### Keywords de intención de compra que se están dejando sobre la mesa

De todas estas, la página nombra Apple y poco más:

```
a domicilio · recogida · precio · cuánto cuesta · urgente · mismo día
24 horas · cerca de mí · pantalla portátil · no enciende · recuperación de datos
cambio de disco SSD · batería · teclado · líquido derramado
Mac / MacBook · HP · Lenovo · Dell · Asus · Acer · Toshiba
```

---

## 6. Calidad de la página de reparación

### Medición

**578 palabras de HTML total**, de las cuales **~430 son cuerpo real** (la
plantilla de cabecera y pie pesa ~145 palabras, medidas por prefijo/sufijo común
entre páginas).

Es la página más larga del sitio después de `/garantias/`. Sigue estando a **un
tercio** del competidor más flaco y a **un sexto** del más fuerte.

**El diagnóstico de contenido delgado de agosto no se ha movido.** Medición
completa del sitio, cuerpo real (total menos ~145 de plantilla):

| Página | Cuerpo real |
|---|---|
| `/garantias/` | **1.644** |
| `/servicios/reparacion-de-computadores/` | **433** |
| `/` (home) | 326 |
| `/servicios/soporte-ti-empresarial/` | 232 |
| `/servicios/camaras-de-seguridad/` | 164 |
| `/servicios/redes-de-datos/` | 156 |
| `/servicios/alquiler-de-computadores/` | 152 |
| `/blog/camaras-seguridad-que-preguntar/` | 138 |
| `/blog/alquilar-o-comprar-computadores/` | 136 |
| `/blog/mantenimiento-preventivo-empresas/` | 134 |
| `/nosotros/` | 129 |
| `/contacto/` | 68 |

Tres entradas de blog de ~135 palabras no compiten por nada. Cuatro páginas de
servicio de 150–230 tampoco.

### El problema estructural es peor que el conteo

**Medido.** Los encabezados de la página de reparación:

```
H1  Reparación de computadores en Medellín
H2  Preguntas frecuentes
H2  Contacto      ← pie de plantilla
H2  Horario       ← pie
H2  Cobertura     ← pie
H2  Cookies       ← pie
```

Entre el H1 y las FAQ **no hay un solo subtítulo**: cuatro párrafos corridos. Ni
Google ni un modelo de lenguaje pueden extraer un pasaje sobre «cuánto tarda» o
«qué marcas reparan» si nada lo delimita. Eso vale tanto como las palabras que
faltan, o más.

### Qué le falta para ser contenido completo

Objetivo: **1.200–1.500 palabras**, cada bloque bajo su propio encabezado.

1. **Recogida a domicilio** — sección propia, con las condiciones reales
   (pendiente de confirmar con Santiago: costo, cobertura, plazos). Va arriba.
2. **Tipos de falla, uno por H3** — no enciende · pantalla rota · lentitud ·
   virus · el sistema no arranca · disco dañado · sobrecalentamiento · batería
   que no carga · teclado · líquido derramado. Cada uno con síntoma, causa
   probable y qué hace MiPC. Aquí está el grueso de las palabras que faltan, y
   son palabras que corresponden a consultas reales.
3. **Marcas, nombradas** — HP, Lenovo, Dell, Asus, Acer, Toshiba, Apple/MacBook.
   Hoy solo Apple. La gente busca «reparación portátil HP Medellín».
4. **Tiempos por tipo de trabajo** — existe «un día hábil» para el diagnóstico;
   falta el resto: software vs. cambio de componente vs. esperar repuesto.
5. **Escritorio / portátil / todo-en-uno** como secciones propias.
6. **Zonas atendidas a nivel de barrio** — ver §4.
7. **La garantía de 30 días arriba**, con enlace a `/garantias/`. Es la mejor
   carta y está de última.
8. **El precio arriba**, con el párrafo de por qué se dice.

### Sobre si el precio y la garantía son un diferenciador

Sí, y están infraexplotados. No porque falten del sitio, sino porque cada uno
está dicho **una vez y en el lugar equivocado**. Ambos deberían estar:

- en la mitad superior de la página,
- en el `Service` schema como `offers`,
- en la ficha de Google Business Profile,
- y con un encabezado propio que los haga extraíbles.

---

## 7. Preparación para respuestas de IA (GEO/AEO)

### A favor — es más de lo esperado

**Medido:**

- HTML servido desde el servidor, sin JavaScript de por medio. Un rastreador que
  lea HTML lee la página entera.
- `FAQPage` con 5 preguntas, con respuestas ya citables tal cual. La de los
  $25.000 es una respuesta completa en sí misma.
- Entidad bien definida: NIT, razón social, fundación, coordenadas, CID de
  Google, `sameAs`.
- `BreadcrumbList` correcto.
- **TTFB de 0,39 s** desde el edge de Miami. Ningún rastreador abandona por
  lentitud.

### En contra

1. **El bloqueo de Cloudflare** (§2). Con `CCBot` cortado, MiPC no entra en el
   corpus del que salen las respuestas por defecto.
2. **`llms.txt` → 404.** Opcional, y Google lo ignora, pero es barato.
3. **Cero menciones externas.** Buscando `"MiPC Tecnología" Medellín`, lo único
   que aparece fuera del propio dominio es Instagram. Sin directorios
   (Páginas Amarillas Colombia, Cylex, directorios locales de Medellín, Cámara
   de Comercio), sin prensa, sin reseñas en plataformas terceras.
   **Un modelo no cita a quien nadie más nombra.** *Estimado, pero con
   confianza alta:* esto es lo que más pesa para no aparecer en una respuesta de
   IA, más que cualquier ajuste on-page.
4. **La página no responde, en su texto, la pregunta que se le hace al modelo.**
   «¿Dónde reparar un computador en Laureles?» quiere un párrafo con dirección +
   horario + precio + garantía + qué reparan. Ese párrafo no existe: los datos
   están repartidos entre el pie, las FAQ y el schema.
5. **Comentarios de desarrollo en el HTML de producción.** En `/contacto/` viaja
   al cliente el comentario sobre `gclid`, la plantilla de conversiones offline
   de Google Ads y los campos `disabled`. Un rastreador de IA lo lee como texto
   de la página.

### Nota sobre `FAQPage`

Google retiró los resultados enriquecidos de FAQ para todos los sitios el
**7 de mayo de 2026**. No esperar que se vean en el SERP. **No quitarlo** —sigue
siendo estructura legible para extracción— pero no contarlo como fuente de
clics.

### ¿Aparece MiPC hoy si alguien le pregunta a un modelo?

**No se puede consultar, así que no se afirma.** Por lo medido —CCBot bloqueado,
cero menciones fuera del dominio propio, y el propio sitio describiéndose como
«soporte TI empresarial»— la respuesta razonable es que no. Arreglar esos tres
es lo que lo cambia.

---

## 8. Salud técnica

| Qué | Resultado |
|---|---|
| TTFB / descarga home | **0,40 s**, 34,8 KB |
| TTFB / descarga página reparación | **0,39 s**, 25,4 KB |
| Sitemap | ✓ `sitemap-index.xml` → `sitemap-0.xml`, **30 URLs**, todas `200` |
| `robots.txt` | ⚠ contaminado por Cloudflare (§2). El sitemap sí está declarado |
| Canonical | ✓ correcto en todas las páginas revisadas |
| Sin barra final | ✓ `307` a la versión con barra |
| 404 | ✓ devuelve `404` real |
| `https://www.mipc.com.co/` | ✗ **`200`, debería ser `301`** |
| `http://mipc.com.co/` | ✗ **`200`, sin redirección a HTTPS** |
| URLs viejas de WordPress | ✓ `301` correctos |
| `mipctecnologia.com` | ✗ **`302` → `app.mipc.com.co`, que NO resuelve (NXDOMAIN)** |
| Móvil | ✓ viewport correcto, layout flexible, fuente precargada |
| Imágenes | ✓ WebP, `width`/`height`, `loading="lazy"`, alt descriptivo |
| Cabeceras de seguridad | Sin HSTS, sin CSP, sin `X-Content-Type-Options` |

### Detalles que merecen nota

**`www` y `http` devuelven 200.** Tres hosts sirven el mismo HTML. El canonical
apunta bien a la versión buena en los tres casos, así que el daño está
contenido, pero es una regla de redirección de cinco minutos en Cloudflare.

**`mipctecnologia.com` redirige a un dominio muerto.** Medido: `302` →
`https://app.mipc.com.co` → **no resuelve**. Cualquiera que llegue por el dominio
viejo cae en un error de red. Y **vence el 2026-09-19**, en cinco semanas. Hay
que traspasarlo y cambiarlo a `301` → `https://mipc.com.co/` antes de renovarlo.
Ya estaba en la lista de pendientes; lo que es nuevo es que el destino actual
está roto, no solo mal configurado.

**Peso de recursos.** Medido:

| Recurso | Peso |
|---|---|
| `placa-madre-detalle.webp` | **271.300 B** |
| `tecnico-instalacion-pantalla.webp` | **152.010 B** |
| `archivo-latin-standard-normal.woff2` | 90.104 B |
| `Base.L4TEFPoi.css` | 44.041 B |
| `og-default.jpg` | 45.690 B |
| `logo-mipc.svg` | 10.710 B |

Las dos imágenes suman **423 KB** y están debajo del pliegue con `lazy`, así que
no tocan el LCP — pero son 423 KB innecesarios en un móvil con datos.

**Core Web Vitals: la inferencia de esta auditoría sobraba, ya estaba medido.**
Aquí se dedujo, a partir del TTFB de 0,39 s y de que no hay imagen de héroe,
que el LCP «debería dar verde». No hacía falta deducirlo:
`verificacion-produccion.md` §5 lo midió con emulación de dispositivo real
(390 × 844, DPR 3, `isMobile: true`) y dio **LCP de 252 ms** contra un umbral
de 2.500 ms.

Sigue faltando el dato **de campo** (CrUX, usuarios reales), que es distinto de
una medición de laboratorio por buena que sea. Para tenerlo: crear Search
Console y mirar el informe de Core Web Vitals. Con un LCP de laboratorio diez
veces por debajo del umbral, la prioridad de conseguirlo es baja.

---

## 9. Medibilidad

### Verificable desde fuera — hecho, leyendo el JavaScript de producción

- ✓ `gtag.js` con **`G-S7TNWFZT72`** carga `async` en el `<head>` de todas las
  páginas.
- ✓ El manejador de clics existe y está bien escrito: escucha en **burbujeo**
  sobre `document`, usa `closest('a[href]')` para capturar clics en el `<svg>`
  interior del botón flotante, y emite `clic_whatsapp` / `clic_telefono` con
  `metodo` y `origen` (el pathname, recortado a 100 caracteres). Correcto.
- ✗ **`const adsId = undefined;`** — compilado literalmente así en producción.
  **Google Ads no está conectado al sitio**, confirmado en el código.

  Matiz que esta auditoría dio por sabido y estaba desactualizado: **la cuenta
  de Google Ads sí existe desde el 2026-08-16 (`230-212-2952`)**, según
  `docs/despliegue-corte-dominio.md`. Lo que falta no es la cuenta, es poner
  `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` en las Build
  variables del Worker para que `adsId` deje de ser `undefined`.

### Hallazgo nuevo: el consentimiento por defecto deniega la analítica

**Medido.** El Consent Mode arranca así:

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500,
});
```

Solo pasa a `granted` si el visitante toca «Aceptar» en el banner, o si ya lo
tocó en una visita anterior (`localStorage: mipc-consentimiento`).

Con Consent Mode v2 los eventos **sí se envían** —como pings sin cookies— así
que GA4 no queda ciego. Pero para la mayoría de visitantes que nunca tocan el
banner las conversiones serán **modeladas, no observadas**, y las modeladas no
se importan a Google Ads como conversiones observadas.

**No es un bug: es una decisión de privacidad legítima y bien implementada.**
Pero es el detalle que va a hacer que los números no cuadren cuando se abra la
cuenta de Ads, y conviene saberlo **antes** de gastar el primer millón en clics,
no después.

### No verificable desde fuera

No se puede comprobar si hay eventos llegando a la propiedad GA4, cuántos, ni si
`clic_whatsapp` y `clic_telefono` están marcados como eventos clave. Eso requiere
entrar a la propiedad. La única comprobación posible desde fuera sería disparar
un clic manualmente y mirarlo en el informe de tiempo real.

---

## 10. Plan de acción priorizado

Ordenado por impacto sobre **captar clientes de reparación**, no por elegancia
técnica. Cada acción dice qué mueve.

### Quick wins — esta semana, ninguna pasa de una hora

| # | Acción | Dónde | Impacto sobre captar clientes de reparación |
|---|---|---|---|
| 1 | **Desactivar el Managed robots.txt** | Panel de Cloudflare → zona `mipc.com.co` → AI Crawl Control | Abre CCBot, GPTBot, ClaudeBot y Google-Extended. **No es bloqueante** —ver el veredicto— y no mueve el orgánico: es la apuesta de largo plazo para que un modelo conozca a MiPC sin tener que buscarlo |
| 2 | **Prefill del WhatsApp flotante por página** | `src/components/ui/FlotanteWhatsApp.astro:14` — el mensaje está fijo en una constante del frontmatter; hay que pasarlo como `prop` desde la plantilla de servicio | Conversión directa. Es el clic más probable de un particular en móvil y hoy le pone en la boca «para mi empresa» |
| 3 | **«Reparación de computadores» en `LocalBusiness.description`** | `src/data/empresa.ts` | Ese campo es lo que un modelo lee para resumir qué es MiPC. Y lo que Google usa en el knowledge panel |
| 4 | **`offers` en el `Service` schema** con los $25.000 COP | `src/lib/jsonld.ts` | El precio pasa de prosa a dato. Es lo que permite a un modelo responder «$25.000» en vez de «consultá» |
| 5a | **`http://` → `https://`**: activar *Always Use HTTPS* | Cloudflare → SSL/TLS → Edge Certificates | Ya estaba en `verificacion-produccion.md` §5.2 |
| 5b | **`301` de `www`**: regla de redirección en el panel | Cloudflare → Rules → Redirect Rules. **NO en `public/_redirects`**, que el build pisa (ver arriba) | Higiene de indexación. Tres hosts sirviendo el mismo HTML |
| 6 | **`mipctecnologia.com`: `301` a `https://mipc.com.co/`** | Traspaso + regla | El destino actual **no resuelve**: hoy cae en NXDOMAIN. **Vence el 2026-09-19** |
| 7 | **Sacar los comentarios de desarrollo del HTML** | `src/components/ui/Formulario.astro`, `src/components/Atribucion.astro` | Higiene. Un rastreador de IA los lee como contenido |

`offers` recomendado:

```json
"offers": {
  "@type": "Offer",
  "name": "Diagnóstico",
  "price": "25000",
  "priceCurrency": "COP",
  "description": "Abonable a la reparación si se autoriza"
}
```

### Estructurales — las próximas cuatro semanas

| # | Acción | Impacto |
|---|---|---|
| 8 | **Reescribir la página de reparación: de ~430 a 1.200–1.500 palabras**, con la estructura de encabezados de §6 y la recogida a domicilio arriba | Es *la* acción. Sin esto no se compite: el competidor más flaco tiene el triple de contenido |
| 9 | **Reposicionar la home como bicéfala.** `<title>` tipo `Reparación de Computadores y Soporte TI en Medellín \| MiPC Tecnología` | Recupera la señal que tenía el WordPress viejo sin perder la nueva. El bloque «Dos formas de empezar / Mi computador falla» ya existe: hay que subirlo |
| 10 | **Crear Search Console** | Sin esto nunca se sabrá qué consultas de reparación están rozando, ni si la página de barrio de §4 se justifica |
| 11 | **Pedir reseñas en la ficha de Google** | Para el map pack de «reparación de computadores Medellín» el volumen y la frescura de reseñas pesan más que cualquier palabra de la página. Megatintas, a diez cuadras en Laureles, aparece con 4,6 sobre 21 reseñas: esa es la vara del barrio, y es baja |
| 12 | **Citations en directorios locales** | Páginas Amarillas Colombia, Cylex, directorios de Medellín, Cámara de Comercio. Con NAP idéntico al del sitio. Es lo que arregla el «cero menciones externas» de §7 |
| 13 | **Tres entradas de blog sobre reparación** | Hoy los tres posts son B2B y ninguno sostiene el clúster de reparación. Con ~135 palabras cada uno, además, no compiten por nada |
| 14 | **Recomprimir las dos imágenes de la página de reparación** | 423 KB debajo del pliegue. No toca el LCP, pero es peso gratis en móvil |

---

## 11. Pendiente de confirmar con Santiago

Siguiendo la regla de no deducir datos del negocio (ver
`docs/diagnostico-seo-geo-ads.md` y el caso de `bodega-el-palo`):

1. **Recogida a domicilio: ¿tiene costo?** ¿Es gratis por encima de cierto valor
   de reparación?
2. **¿Hasta dónde llega la recogida?** El pie declara Medellín, Envigado,
   Sabaneta, Itagüí, Bello y La Estrella como «cobertura», pero no está dicho si
   la recogida cubre lo mismo que el soporte empresarial.
3. **¿Cuánto tarda la recogida?** ¿Mismo día, día siguiente, se agenda?
4. **Marcas que efectivamente se reparan.** Antes de listar HP, Lenovo, Dell,
   Asus, Acer y Toshiba en la página hay que confirmar que se atienden todas.
5. **Tiempos reales por tipo de trabajo**, para la sección de tiempos.

Sin 1, 2 y 3 la sección de recogida —que es el mayor diferenciador
identificado— se queda a medias.

---

## Fuentes de la comparación de competencia

Leídas en vivo el 2026-08-16. **Se citan por su contenido, no por su posición en
el SERP**, que no fue medible.

- <https://reparaciondecomputadoresmedellin.com.co/>
- <https://reparacionesjd.com.co/medellin/laureles/>
- <https://tirescue.com/reparacion-de-computadores/>
- <https://www.expertosdigitales.net/mantenimiento-de-computadores-laureles-.html>
- <https://directoriomedellin.com.co/medellin/comercio/megatintas-medellin-servicio-tecnico-reparacion-de-impresoras-epson-canon-hp-y-computadores/>
  — Megatintas, competidor con presencia física en Laureles-Estadio
- <https://www.mipc-soluciones.com/contact.html> — «Mi PC Soluciones IT S.A.S.»,
  homónimo adicional a vigilar
