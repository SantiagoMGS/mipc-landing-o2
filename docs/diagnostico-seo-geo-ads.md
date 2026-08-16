# Diagnóstico SEO, GEO y preparación para Google Ads

Auditoría del sitio nuevo hecha el **2026-08-16** contra el despliegue real en
`https://mipc-landing-o2.santiago-martinez.workers.dev/`, el sitio de WordPress
que reemplaza (`https://mipc.com.co/`) y el código de este repositorio.

Este documento existe para que quien continúe el desarrollo sepa qué está
medido, qué está inferido y qué falta. **Distingue explícitamente las dos
cosas**: donde dice «medido» hay un comando y una fecha detrás; donde dice
«estimado» hay un razonamiento que nadie ha comprobado todavía.

Objetivo del cliente, en sus palabras: reemplazar `mipc.com.co` para mejorar
posicionamiento, SEO, GEO, **pagar publicidad en Google** y captar clientes.
Las prioridades de abajo están ordenadas por ese objetivo, no por elegancia
técnica.

---

## Estado de aplicación (2026-08-15)

Este bloque se añade después de la auditoría. El diagnóstico de abajo queda
**tal como se escribió**, sin retocar: sirve de registro de en qué estado se
encontró el sitio. Lo que cambió es esto.

**Aplicado y verificado** (`npm run verify`: 0 errores de tipos, 32 páginas,
94 tests, 183 enlaces):

| § | Corrección | Dónde |
|---|---|---|
| 1.1 | Conversión de formulario en `/gracias/` (`generate_lead` + `conversion` con `send_to`) | `src/components/ConversionFormulario.astro` |
| 1.2 | Clics de WhatsApp medidos, por delegación en `document` | `src/components/EventosMedicion.astro` |
| 1.3 | Clics en `tel:` medidos, mismo manejador | `src/components/EventosMedicion.astro` |
| 1.4 | Captura de `gclid`/`wbraid`/`gbraid`/UTM y campos ocultos en el formulario | `src/components/Atribucion.astro`, `src/components/ui/Formulario.astro` |
| 1.5 | `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` declaradas | `.env.example` |
| 2.1 | Corregida la nota falsa del Paso 2 sobre la inyección automática de `noindex` | `docs/despliegue-corte-dominio.md` |
| 2.3 | Comodín `/wp-content/uploads/*` → `/`, con URL de ejemplo verificable | `src/data/redirecciones.ts`, `scripts/check-redirecciones.mjs` |
| 4 | `image`, `geo`, `priceRange` y `hasMap` en `localBusiness()` | `src/lib/jsonld.ts`, `src/data/empresa.ts` |
| 4 | `BreadcrumbList` en `/contacto/` y `/nosotros/` | esas dos páginas |

Dos decisiones que se apartan de la letra del diagnóstico, con motivo:

- **Los clics de WhatsApp y de teléfono NO llevan `send_to` de Ads.** Van a
  GA4 como eventos y se importan a Ads desde allí como eventos clave. Un clic
  en WhatsApp no es una conversión inequívoca —se abre la aplicación y puede
  no escribirse nada—, y así se decide en la interfaz cuáles cuentan sin
  volver a desplegar, ni configurar una etiqueta de conversión por canal.
  **Requiere un paso manual en GA4 y en Ads**, anotado en el Paso 1 del
  documento de despliegue. Sin él, Ads seguirá viendo solo los formularios.
- **La captura de atribución no espera al consentimiento**, y está declarada
  en `/privacidad/`, apartado 2. Son los parámetros que el visitante trae en
  su propia URL, guardados en `sessionStorage`, que salen del navegador solo
  si él envía el formulario. Las etiquetas de Google siguen denegadas de
  entrada, que es lo que gobierna el banner.

Las coordenadas de `geo` (6.240407, -75.586452) las aportó el cliente el
2026-08-15 **copiadas del pin de la ficha de Google**, no estimadas a partir
de la dirección. Es la misma exigencia que ya se aplicaba al horario: el
schema del sitio y la ficha tienen que decir lo mismo. Si el pin se mueve,
`src/data/empresa.ts` se mueve.

**No tocado** (es trabajo de redacción, no de código): §3 entero, §5 y la
compresión de imágenes de §6.

---

## Veredicto

El sitio nuevo es muy superior al que reemplaza y su base técnica está entre
las mejores que se ven en un negocio de este tamaño. Los problemas no son de
construcción: son **de contenido y de medición**.

| Categoría | Peso | Puntaje | Estado |
|---|---|---|---|
| SEO técnico | 22% | 92 | Sólido |
| Calidad de contenido | 23% | **45** | **Es el cuello de botella** |
| SEO on-page | 20% | 88 | Sólido |
| Schema | 10% | 82 | Bien, con huecos |
| Rendimiento | 10% | 85 | **Estimado, no medido** |
| Preparación para IA (GEO) | 10% | 65 | Buena base, falta densidad |
| Imágenes | 5% | 78 | `alt` excelente, peso alto |

**Total: 75/100.**

Los dos hallazgos que importan:

1. **No se puede medir una sola conversión.** El cliente quiere pagar
   publicidad y hoy el sitio no puede decirle qué anuncio trae clientes.
2. **El contenido es demasiado delgado para competir en orgánico.** Páginas de
   servicio de 171 a 475 palabras y tres entradas de blog de ~190.

---

## Prioridad 1 — Medición de conversiones (bloquea el objetivo de Ads)

Este es el hallazgo más caro del diagnóstico y el que justifica el orden de
todo lo demás.

`src/components/Analitica.astro` está **bien construido**: carga GA4 y Google
Ads con Consent Mode v2, no emite una línea si faltan los IDs, y el bloque de
`consent default` va antes de `gtag.js`, que es el orden correcto y no es
intercambiable. Nada de eso hay que tocarlo.

El problema es que **carga las etiquetas y ahí se detiene**. No hay ni un solo
evento de conversión en todo el repositorio.

### 1.1 `/gracias/` no dispara conversión

`src/pages/gracias.astro` es la página a la que Web3Forms redirige tras un
envío correcto (`Formulario.astro` la pasa en el campo oculto `redirect`). Es
la única señal inequívoca de «este visitante se convirtió en contacto» que
tiene el sitio, y no emite nada.

Falta un `gtag('event', 'conversion', { send_to: '<ADS_ID>/<LABEL>' })` en esa
página. Debe respetar la misma regla que el resto del componente: si no hay
`PUBLIC_GOOGLE_ADS_ID`, no se emite nada.

`noindex` en esa página está bien y debe quedarse — es correcto para búsqueda
y no afecta a la medición.

### 1.2 Los clics de WhatsApp no se miden en absoluto

Por la estructura del sitio, **WhatsApp es el canal de contacto principal**,
no el formulario:

- `src/components/ui/FlotanteWhatsApp.astro` — botón fijo en todas las páginas
- `src/components/ui/CTAWhatsApp.astro`
- La tarjeta «Soy persona» de la home enlaza directo a `wa.me`

Ninguno emite evento. Hoy el canal por el que probablemente entra la mayoría
de los contactos es invisible para GA4 y para Ads.

Como los enlaces salen del sitio, hay que medirlos en el clic. Conviene
centralizar el evento en el componente en vez de repetirlo en cada plantilla —
`src/lib/whatsapp.ts` ya centraliza la construcción de las URL y es el sitio
natural para ello.

### 1.3 Los clics en `tel:` no se miden

Hay dos en cada página: la barra de identificación superior y el botón del
`Header.astro`. Para un negocio de servicio local la llamada es una conversión
de primer orden. Tampoco emite nada.

### 1.4 El formulario no captura `gclid` ni UTM — esto es lo que cuesta dinero

`src/components/ui/Formulario.astro` envía a Web3Forms `nombre`, `email`,
`telefono` y `mensaje`, más los campos ocultos de configuración. **No captura
`gclid` ni parámetros UTM.**

Consecuencia concreta: MiPC vende a empresas con ciclo de venta. El contacto
llega hoy y se cierra por teléfono dos o tres semanas después. Sin `gclid`
guardado junto al contacto, **esa venta nunca puede volver a Google Ads** como
conversión offline. Google seguirá optimizando hacia «formularios enviados»
sin saber cuáles se convirtieron en dinero.

Lo que hace falta:
- Leer `gclid` y los `utm_*` de la URL de entrada
- Persistirlos (p. ej. en `sessionStorage`) para que sobrevivan a la
  navegación entre páginas antes de llegar a `/contacto/`
- Escribirlos en campos ocultos del formulario para que viajen en el correo de
  Web3Forms

### 1.5 `.env.example` no declara la variable de Ads

```
PUBLIC_WEB3FORMS_KEY=
PUBLIC_GA4_ID=
```

`Analitica.astro` **también lee `PUBLIC_GOOGLE_ADS_ID`**, pero no está en el
ejemplo. Quien configure el despliegue copiando ese archivo nunca sabrá que la
variable existe, y las etiquetas de Ads no se cargarán aunque todo lo demás
esté bien. Añadirla, con `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` si se separa el
identificador de la etiqueta de conversión.

### Criterio de aceptación de la Prioridad 1

Con `PUBLIC_GOOGLE_ADS_ID` puesto, en el HTML construido deben existir
manejadores de evento para: envío completado (`/gracias/`), clic de WhatsApp y
clic en `tel:`. Sin la variable, `grep -ri "gtag\|dataLayer" dist/` no debe
devolver **nada** — la regla de oro del componente actual, que
`tests/analitica.test.ts` ya comprueba contra el build real y que hay que
mantener al añadir los eventos.

---

## Prioridad 2 — Corte de dominio

### 2.1 El `noindex` está acotado por host y NO amenaza a producción

Medido el 2026-08-16:

```
curl -I https://mipc-landing-o2.santiago-martinez.workers.dev/
  →  x-robots-tag: noindex
```

La cabecera **sí se está sirviendo**, y viene de `public/_headers` con el host
real ya corregido. Las dos reglas están acotadas a
`https://mipc-landing-o2.santiago-martinez.workers.dev/*` y
`https://mipc-landing-o2.pages.dev/*`. **Ninguna de las dos coincide con
`https://mipc.com.co/*`**, así que dejarlas puestas no puede volver noindex al
dominio de producción.

Esto rebaja el riesgo respecto de cómo lo describe
`docs/despliegue-corte-dominio.md`, pero **no lo elimina**: si alguien
generaliza esas reglas a `/*` «para simplificar», el sitio de producción
desaparece de Google sin dar ningún error. La regla es host-scoped a propósito
y debe seguir siéndolo.

**Corrección a `docs/despliegue-corte-dominio.md`:** el Paso 2 afirma que
«Cloudflare ya inyecta `X-Robots-Tag: noindex` en todo `*.workers.dev` por su
cuenta». La medición del 2026-08-15 registrada en ese mismo documento
demuestra lo contrario: el despliegue **no traía la cabecera** hasta que se
corrigió el host en `public/_headers`. Las dos afirmaciones no pueden ser
ciertas a la vez, y la que tiene una medición detrás es la segunda. Conviene
corregir esa nota para que nadie se salte el paso confiando en una inyección
automática que no ocurre.

Verificación obligatoria después del corte, y no darla por hecha:

```bash
curl -I https://mipc.com.co/ | grep -i x-robots   # debe devolver NADA
```

### 2.2 El mapa de redirecciones está completo — verificado

Comprobé `src/data/redirecciones.ts` contra los cuatro sub-sitemaps reales de
WordPress el 2026-08-16 (`wp-sitemap-posts-post-1`, `posts-page-1`,
`taxonomies-category-1`, `users-1`). **Las 12 URLs del sitio viejo tienen
destino 301**, más dos alias del menú que no aparecen en el sitemap
(`/experiencia/`, `/actualidad/`) y que son justo las formas que un enlace
externo tendría más probabilidad de haber copiado.

Esto es lo que normalmente se hace mal en una migración y aquí está bien
hecho. No tocar salvo para añadir lo de abajo.

### 2.3 Falta cubrir `/wp-content/uploads/*`

Único hueco que encontré. Las imágenes de WordPress pueden estar indexadas en
Google Imágenes o enlazadas desde fuera. Es barato cubrirlo con una regla
comodín hacia `/` o hacia la sección equivalente.

---

## Prioridad 3 — Contenido (el cuello de botella del orgánico)

### 3.1 Las páginas de servicio son demasiado cortas

Palabras de cuerpo en el Markdown, medidas el 2026-08-16:

| Archivo en `src/content/servicios/` | Palabras |
|---|---|
| `reparacion-de-computadores.md` | 475 |
| `soporte-ti-empresarial.md` | 265 |
| `alquiler-de-computadores.md` | 188 |
| `camaras-de-seguridad.md` | 178 |
| `redes-de-datos.md` | **171** |

Renderizadas dan entre 461 y 729 palabras totales, pero ahí van incluidas
cabecera, navegación y pie — unas 200 de cromo que se repiten en todas las
páginas y no aportan señal.

Para consultas comerciales locales en Medellín, 171 palabras de cuerpo no
compiten. Solo «reparación de computadores» tiene un cuerpo defendible.

**Objetivo: 700–900 palabras de cuerpo por servicio**, empezando por
`redes-de-datos` y `camaras-de-seguridad`, que son las dos más débiles y
además las de mayor valor de contrato.

### 3.2 Las preguntas frecuentes están infrautilizadas

Preguntas por servicio hoy:

| Servicio | FAQ |
|---|---|
| `reparacion-de-computadores` | 6 |
| `alquiler-de-computadores` | 2 |
| `soporte-ti-empresarial` | 2 |
| `camaras-de-seguridad` | 1 |
| `redes-de-datos` | 1 |

Subir a 5–6 por servicio es la forma más barata de engordar esas páginas con
contenido que la gente sí busca, y alimenta directamente el GEO (sección 5).

**Aviso sobre `FAQPage`:** el schema está presente en las cinco páginas y
**no hay que quitarlo**, pero tampoco esperar rendimiento de él en la SERP.
Google retiró los resultados enriquecidos de FAQ para todos los sitios el
**7 de mayo de 2026**; ya no produce ninguna función visible en el resultado.
Sigue sirviendo al visitante y a los motores generativos. El valor está en el
contenido de las preguntas, no en el marcado.

### 3.3 El blog es un marcador, no contenido

Tres entradas de ~190 palabras cada una (`alquilar-o-comprar-computadores`,
`camaras-seguridad-que-preguntar`, `mantenimiento-preventivo-empresas`). Los
títulos y los ángulos están bien elegidos; la extensión no da para posicionar
ni para ser citado.

Objetivo por entrada: **1.200+ palabras**, priorizando preguntas de precio y
de decisión de compra, que son las que preceden a una contratación.

### 3.4 No hay páginas por municipio

El sitio declara cobertura en seis municipios en el pie, en el hero y en
`areaServed` del schema, pero «cámaras de seguridad Envigado» o «soporte
técnico Itagüí» no tienen dónde aterrizar.

Cinco páginas está muy por debajo del umbral donde esto se vuelve riesgoso
(30+), **pero solo si cada una tiene contenido genuinamente distinto**. Una
plantilla con el nombre del municipio cambiado es contenido delgado y Google
la trata como tal.

La munición ya existe: hay 12 proyectos reales en `src/content/proyectos/`,
varios de ellos identificables por municipio
(`global-la-estrella-*`, `obra-tablaza-*`). **Cada página de municipio debe
anclarse a un proyecto real hecho ahí.** Si un municipio no tiene proyecto
propio, es mejor no crearle página que inventarle contenido.

### 3.5 Cero reseñas y autoría genérica

- **No hay ninguna reseña ni testimonio citado en el sitio**, pese a que existe
  ficha de Google (CID `15154712519055002689` en `sameAs`).

  **No añadir `AggregateRating` autodeclarado.** Google lo ignora en la mayoría
  de casos para `LocalBusiness` y penaliza el inventado. La vía real es
  acumular reseñas en el perfil de Google Business y citar textualmente, con
  nombre de la empresa que la dio, las que ya existan.

- `article()` en `src/lib/jsonld.ts` declara `author` como `Organization`. Para
  contenido técnico, un autor persona con página propia y biografía —17 años en
  el oficio— es una señal de experiencia bastante más fuerte. Hoy no existe
  ninguna página de autor.

---

## Prioridad 4 — Schema y on-page (huecos concretos)

`localBusiness()` en `src/lib/jsonld.ts` no incluye:

- **`image`** — propiedad recomendada por Google para `LocalBusiness`
- **`geo`** — coordenadas; ayudan a desambiguar frente a los homónimos
- **`priceRange`**
- **`hasMap`** — ya existe el CID de la ficha en `sameAs`, es trivial derivarlo

`/contacto/` y `/nosotros/` **no llevan `BreadcrumbList`**, aunque las páginas
de servicio y de proyecto sí lo tienen. Es una inconsistencia menor pero
gratuita de arreglar: la función `breadcrumb()` ya existe.

**Lo que NO hay que tocar**, porque ya está bien: títulos de 50 a 63
caracteres, todos únicos y con «Medellín»; meta descripciones de 138 a 161
caracteres, todas escritas a mano; canónicas ya apuntando a `mipc.com.co`;
`trailingSlash` consistente; sitemap generado y filtrado; el NAP con fuente
única de verdad en `src/data/empresa.ts`; el texto alternativo descriptivo real
en todas las imágenes; y el 404 que devuelve 404 de verdad vía
`wrangler.jsonc`.

---

## Prioridad 5 — GEO (visibilidad en motores generativos)

### Lo que ya está bien resuelto, y es notable

El **NIT en el schema como desambiguador** (`taxID` + `identifier`). El
comentario de `src/data/empresa.ts` documenta que «MiPC» colisiona con al menos
cinco entidades de nombre casi idéntico y que hay evidencia de que los modelos
las mezclan. Es exactamente la jugada correcta: un NIT no se repite. Mantenerlo
y no diluirlo.

También hay **datos duros citables**, que es lo que los motores generativos
usan: diagnóstico por $25.000, horarios, cobertura, año de fundación, 12
proyectos con cliente nombrado.

Y `robots.txt` con `Allow: /` deja pasar a GPTBot, ClaudeBot y PerplexityBot,
que es lo correcto aquí.

### Lo que falta: densidad

La citabilidad por pasajes necesita respuestas autocontenidas. Con 190 palabras
por entrada de blog no hay casi nada que citar. **No existe ninguna página que
responda directamente** preguntas del tipo:

- «cuánto cuesta instalar cámaras de seguridad en Medellín»
- «qué incluye un contrato de soporte TI mensual»
- «cuánto cuesta alquilar computadores para una empresa»

Que es justo lo que un gerente le pregunta a ChatGPT antes de pedir
cotizaciones. Esto se resuelve con la Prioridad 3, no con marcado.

**`llms.txt`:** no existe. Es opcional, Google no lo usa. **No es prioridad**
y no conviene gastar tiempo ahí antes de resolver el contenido.

---

## Prioridad 6 — Rendimiento e imágenes

### Rendimiento: NO MEDIDO

**No pude medirlo.** PageSpeed Insights devolvió HTTP 429 en cuatro intentos
(límite de tasa sin clave de API) el 2026-08-16. Cualquier afirmación sobre
Core Web Vitals en este documento es una expectativa, no un dato.

Lo que sí es verificable de la construcción: HTML estático, cero framework de
JS en el cliente, 44 KB de CSS, imágenes responsive en WebP con `width` y
`height` explícitos en todas partes, y `fetchpriority="high"` en el héroe. Es
un perfil que normalmente da buen LCP y CLS cercano a cero.

**Hay que medirlo con datos de campo después del corte**, no antes: el
subdominio de Workers no representa el rendimiento del dominio final.

### Imágenes: el héroe está bien, las de proyecto no

Medido sobre `dist/` el 2026-08-16:

- Héroe (`equipo-fachada-alturas`): 151 KB a 1600w, con siete variantes
  responsive. **Bien resuelto.**
- Proyectos: hasta **663 KB en un solo WebP**
  (`los-panes-instalacion-alero`), con al menos siete archivos por encima de
  270 KB.

Las páginas de proyecto son las que peor cargan del sitio. Vale la pena bajar
la calidad de compresión o el ancho máximo de esa colección.

---

## Secuencia recomendada

**Antes del corte** (sin esto, el corte sale mal):

1. Eventos de conversión: `/gracias/`, clics de WhatsApp, clics en `tel:` (§1.1–1.3)
2. Captura de `gclid` y UTM en el formulario (§1.4)
3. `PUBLIC_GOOGLE_ADS_ID` en `.env.example` (§1.5)
4. Redirección de `/wp-content/uploads/*` (§2.3)
5. Corregir la nota errónea del Paso 2 de `docs/despliegue-corte-dominio.md` (§2.1)

**Semana 1 después del corte:**

6. `curl -I https://mipc.com.co/ | grep -i x-robots` → debe devolver nada
7. Search Console y sitemap enviado; **medir Core Web Vitals reales** (§6)
8. Verificar los 301 en producción — ya existe `scripts/check-redirecciones.mjs`
9. `image`, `geo`, `priceRange` y `hasMap` en `localBusiness()` (§4)
10. `BreadcrumbList` en `/contacto/` y `/nosotros/` (§4)

**Antes de gastar el primer peso en Ads** — con conversiones midiendo ya al
menos dos semanas:

11. Servicios a 700–900 palabras, empezando por redes de datos y cámaras (§3.1)
12. FAQ a 5–6 preguntas por servicio (§3.2)
13. Comprimir las imágenes de proyecto (§6)

**Mes 2–3:**

14. Las cinco páginas de municipio, cada una anclada a un proyecto real (§3.4)
15. Página de autor con biografía; `article()` con autor persona (§3.5)
16. Reseñas en el perfil de Google Business, citadas textualmente (§3.5)
17. Blog: entradas de 1.200+ palabras sobre precio y decisión de compra (§3.3)

---

## Cómo sabríamos que esto falló

Cada recomendación de arriba puede estar equivocada. Estas son las señales que
lo dirían, sin necesidad de repetir la auditoría:

- **Si a los 60 días del corte Search Console muestra menos impresiones que las
  que tenía WordPress**, la migración perdió señal. Revisar los 301 antes que
  cualquier otra cosa; el diagnóstico de §2.2 estaría equivocado.
- **Si Ads acumula clics pero cero conversiones registradas tras dos semanas**,
  la medición no quedó bien conectada. No es que el anuncio sea malo: es que
  §1 no se completó de verdad. Comprobar con la vista previa de etiquetas de
  Google, no leyendo el código.
- **Si las páginas de servicio crecen a 900 palabras y a los 90 días no suben
  posiciones**, el problema no era la extensión sino la intención o la
  autoridad de dominio, y hay que reorientar hacia enlaces y reseñas en vez de
  seguir escribiendo.
- **Si las páginas de municipio no reciben impresiones propias a los 90 días**,
  probablemente quedaron demasiado parecidas entre sí. Es el fallo previsto en
  §3.4 y la respuesta es reducirlas, no añadir más.

## Indicadores para vigilar sin repetir la auditoría

- Impresiones y clics por página en Search Console, separando servicios de blog
- Proporción de conversiones por canal: formulario / WhatsApp / llamada
- Coste por conversión en Ads, una vez haya conversiones que contar
- Posición media en consultas que incluyan nombre de municipio
