# Reconstrucción de mipc.com.co en Astro — diseño

**Fecha:** 2026-08-14
**Estado:** aprobado, listo para plan de implementación
**Origen:** auditoría de mipc.com.co del 2026-08-14

---

## 1. Contexto

MiPC Tecnología es una empresa de servicios TI de Medellín, fundada en 2009, con sede en Laureles (Carrera 87A #32-81, Interior 305). Vende reparación de computadores, cámaras de seguridad, redes de datos, alquiler de equipos y mesas de ayuda, con una base de clientes mayoritariamente corporativa: emisoras, IPS, instituciones educativas y firmas de ingeniería.

El sitio actual corre WordPress 6.1.12 con Elementor Pro sobre el tema Twenty Twenty-One, alojado en Hostinger con PHP 8.0.30. No se ha tocado desde abril de 2023 y **no hay nadie en la empresa que pueda administrarlo**.

La auditoría encontró seis fallos críticos, entre ellos que el botón principal del servicio estrella lleva a la página equivocada, que el contenido se desborda de la pantalla en móvil y que no existe ninguna herramienta de medición instalada.

### El diagnóstico de fondo

El sitio no falló por WordPress. Falló porque nadie lo cuidó: nunca se instaló un plugin de SEO, quedó una página duplicada con slug `-copy`, el texto de un servicio es un copiar-pegar de otro. Ninguno de esos errores lo causa la plataforma.

Esto define el criterio rector del diseño: **el sistema nuevo debe hacer estructuralmente imposible repetir esos errores**, no solo corregirlos una vez. De ahí que la validación de contenido y el verificador de enlaces rompan la compilación en lugar de advertir.

---

## 2. Objetivo

Reconstruir el sitio como estático en Astro, eliminando la carga de mantenimiento (PHP, plugins, licencias, actualizaciones), corrigiendo los hallazgos de la auditoría de forma permanente y reposicionando el mensaje hacia el cliente corporativo.

### Criterios de éxito

| Criterio | Medida |
|---|---|
| Cero mantenimiento recurrente | Sin servidor, sin plugins, sin licencias. USD 0/mes de hosting |
| Fallos críticos corregidos | Los 6 CRIT de la auditoría, verificados |
| Posicionamiento preservado | Impresiones en Search Console sin caída sostenida >20% a 4 semanas |
| Base para crecer | 13 URLs al lanzar contra 8 hoy, una por servicio |
| Errores no reproducibles | Enlace roto, H1 ausente o meta faltante rompen la compilación |

---

## 3. Decisiones tomadas

| Decisión | Elección | Razón |
|---|---|---|
| Plataforma | Astro 5, salida 100% estática | Sin servidor que parchear |
| Edición de contenido | Markdown en el repo, sin CMS | El único editor es técnico. Keystatic lee los mismos archivos y se puede añadir después sin migrar |
| Estilos | Tailwind | Sin CSS huérfano acumulándose |
| Hosting | Cloudflare Pages | Gratuito, CDN global, despliegue por `git push` |
| Formularios | Web3Forms hacia `gerencia@mipc.com.co` | Sin backend propio que mantener |
| Analítica | GA4 + Search Console | Gratuitos y se conectan entre sí |
| Alcance de contenido | Reestructuración completa y reenfoque B2B | Es donde está el valor; la migración sola no mueve posiciones |
| Dirección visual | Identidad nueva, marca intacta | El logo y el naranja se conservan; el resto se rehace |

### Por qué no se usa un CMS ahora

Keystatic en modo GitHub daría un panel de administración para una persona no técnica, pero obliga a renderizado híbrido con adaptador de Cloudflare y una GitHub App — es decir, mete rutas de servidor en un sitio que queremos 100% estático, para resolver una necesidad que hoy no existe.

Como Keystatic lee exactamente los mismos archivos Markdown, se puede enchufar más adelante sin migrar contenido. **Las colecciones se diseñan desde el principio con esa compatibilidad en mente:** campos planos, nombres estables, sin lógica en el frontmatter.

---

## 4. Arquitectura de contenido y URLs

### Mapa de migración

| URL actual | URL nueva | Acción |
|---|---|---|
| `/` | `/` | Home reenfocada a B2B |
| `/home/servicios/` | `/servicios/` | 301, pasa a ser hub |
| `/home/servicios-mipc-tecnologia-copy/` | `/nosotros/` | 301 |
| `/home/experiencia/` | `/clientes/` | 301, se reconstruye entera |
| `/home/actualidad/` | `/blog/` | 301 |
| `/home/contacto/` | `/contacto/` | 301 |
| `/garantias/` | `/garantias/` | Sin cambio |
| `/recursos/` | `/recursos/` | Misma URL; se retira «Pack Office» (ver §12) |
| `/intel-anuncia-nuevos-procesadores-de-escritorio-core-de-12a-generacion/` | `/blog/` | 301 |
| `/amazon-anuncia-la-adquisicion-de-la-empresa-de-tecnologia-cuantica-psiquantum/` | `/blog/` | 301 |
| `/google-anuncia-actualizaciones-de-sus-productos-de-realidad-virtual-y-aumentada/` | `/blog/` | 301 |
| `/category/uncategorized/` | `/blog/` | 301 |
| `/author/santiago-martinezmipc-com-co/` | `/` | 301, elimina la exposición del usuario |
| `/wp-sitemap.xml` | `/sitemap-index.xml` | 301 |

`mipctecnologia.com` (hoy devuelve 500) se redirige entero a `mipc.com.co` con 301 a nivel de DNS/hosting.

### Páginas nuevas

```
/servicios/soporte-ti-empresarial/       ← punta de lanza B2B
/servicios/reparacion-de-computadores/   ← mayor volumen de búsqueda
/servicios/camaras-de-seguridad/
/servicios/redes-de-datos/
/servicios/alquiler-de-computadores/
```

Total al lanzar: **13 URLs de contenido**, más dos utilitarias (`/gracias/` tras enviar el formulario y la página 404).

### Decisiones de estructura

- **Slugs sin «medellin».** La ciudad va en title, H1 y schema `LocalBusiness`, que es donde Google la lee. Evita URLs largas permanentes.
- **Sin páginas por zona** (Envigado, Sabaneta, Itagüí) al lanzamiento. Hechas sin contenido genuinamente distinto son contenido delgado duplicado. Se evalúan después.
- **Sin hubs `/empresas/` y `/personas/` separados.** Duplicarían las páginas de servicio. La home segmenta: «Soy empresa» lleva a los servicios corporativos, «Soy persona» va directo a `/servicios/reparacion-de-computadores/`.

---

## 5. Sistema visual

### Concepto

Panel de operación, no folleto. El sitio toma prestado el lenguaje visual del mundo que la empresa habita —racks, tableros de monitoreo, tiempos de respuesta— con estructura precisa en lugar de ondas decorativas y cifras reales como elemento gráfico principal.

El problema que resuelve: hoy se le pide a un gerente de IPS que confíe su infraestructura a una página que parece hecha con plantilla.

### Paleta

| Rol | Color | Uso |
|---|---|---|
| Fondo | `#F2F4F5` | Gris acero frío |
| Superficie | `#FFFFFF` | Tarjetas y bloques |
| Tinta | `#0F1620` | Azul-negro para texto |
| Ancla | `#1E3A47` | Azul petróleo, bloques oscuros |
| Señal | `#EB3A00` | Naranja de marca, solo acción y estado |

El cambio no es la paleta sino **cómo se usa el naranja**. Hoy inunda secciones enteras y por eso deja de significar algo. Pasa a ser color de señal: botones, estado activo, el dato que importa. El azul petróleo carga el peso corporativo.

### Tipografía

- **Archivo** (Omnibus-Type) para todo el texto. Es una fuente variable con eje de ancho (`wdth`, 62–125) además del de peso, así que los titulares usan el ancho expandido del **mismo archivo** — no existe ni hace falta una familia «Archivo Expanded» aparte. Una sola familia, dos anchos.
- **IBM Plex Mono** solo para cifras y etiquetas: años, tiempos de respuesta, número de clientes.

Ambas autoalojadas con subset latino. Se eliminan las cuatro familias de Google Fonts con nueve pesos e itálicas que carga el sitio actual.

La monoespaciada no es decorativa: en un negocio que vende precisión técnica, un tiempo de respuesta en cifras tabulares lee como dato medido, no como eslogan.

### Estructura

Retícula modular con separación por espacio y filetes finos. **Cero ondas.** Tarjetas de servicio en cuadrícula rígida con filete lateral que se enciende en naranja al pasar el cursor.

Inversión respecto al sitio actual: **el muro de clientes sube al primer tercio de la home**. El hero deja de ser una foto genérica y pasa a ser el argumento en cifras: años de experiencia, número de empresas atendidas, cobertura.

### Movimiento y accesibilidad

Movimiento mínimo: aparición escalonada del muro de clientes, estados de hover. Sin parallax ni scroll secuestrado. Contraste **WCAG AA como mínimo**, lo que corrige DIS-02. Respeto de `prefers-reduced-motion`. Foco de teclado siempre visible.

---

## 6. Fotografía y logos

### Fotografía

De las 21 fotos disponibles se seleccionan 12. Están a 1600 px en el lado largo, comprimidas de WhatsApp y con encuadres casuales, pero cubren trabajo real en campo.

> **Numeración:** los números 01–21 corresponden al orden de aparición de las URLs en `Images.txt` (línea 2 = foto 01, línea 22 = foto 21), excluyendo las URLs de logos `Clientes_*`. La implementación debe renombrar los archivos con nombres descriptivos al importarlos.

**El activo diferenciador:** las fotos 15, 20 y 21 muestran cascos, arneses y trabajo en alturas. Para vender a IPS, instituciones educativas y emisoras eso comunica cumplimiento de protocolo de seguridad, algo que ningún competidor de reparación a domicilio puede mostrar.

| Uso | Fotos |
|---|---|
| Pieza principal | 15 |
| Marca visible en uniforme | 02, 01, 19 |
| Seguridad y altura | 20, 21, 18, 14 |
| Redes y CCTV en sitio | 11, 16, 17 (recortando el collage) |
| Reparación, detalle | 06, 07, 09 |
| Cliente identificable | 04 (Belén Arrendamientos) |

Se descartan la 12 (obra de construcción, mensaje equivocado), la 13 (sujeto demasiado lejano) y las 05, 08 y 10 (interiores de PC genéricos sin persona ni marca).

**Tratamiento:** gradación de color unificada hacia el azul petróleo, con saturación reducida. Vienen de cámaras y días distintos; sin esto se nota.

**Restricción de uso:** a 1600 px van justas para un hero a sangre completa en escritorio grande. El hero se resuelve con tipografía y cifras, con la foto en un bloque contenido — lo cual es además coherente con el concepto.

### Fotos pendientes

Cuatro fotos no existen todavía: equipo completo con uniforme, rack terminado con cableado limpio, fachada de la oficina y retrato del líder técnico.

**Los componentes se diseñan con la imagen como campo opcional.** Añadirlas después es cambiar una línea de Markdown, sin rediseño. Sustitutos mientras tanto:

- Equipo → foto 02
- Rack terminado → recorte de la 17
- Fachada → no se usa; la dirección, el horario y el mapa en `/contacto/` más el schema `LocalBusiness` resuelven CRIT-04 mejor que una foto
- Retrato → firma de autoría en texto (nombre, cargo, años)

### Logos de clientes

Los 12 archivos disponibles están a **179 × 105 px**. El sitio actual los muestra a ~180 px de ancho, es decir al doble de lo que aguantan en pantalla retina, y por eso se ven borrosos.

**Solución:** retícula densa a **88 px de ancho de exhibición**, donde un archivo de 179 px cubre los 176 px que exige una pantalla 2x. Quedan nítidos con los archivos existentes.

No es un apaño: un muro denso de marcas pequeñas comunica «muchos clientes» mejor que doce tarjetas grandes espaciadas. Tratamiento **monocromo a una tinta**, estándar en muros B2B, que además disimula diferencias de calidad entre archivos.

Faltan 6 de los 18 logos que muestra el sitio: Radio Tiempo, La Paisana, Vanex, Seiso, LRM y Pedro Justo Berrío. Durante la implementación se intentan recuperar de los sitios de cada cliente. Los que no aparezcan van como **nombre en texto dentro de la misma retícula**, que además es texto indexable.

---

## 7. Arquitectura técnica

### Estructura de contenido

```
src/data/empresa.ts        ← NAP único: nombre, dirección, teléfono,
                              email, horario, geo, redes
src/content/servicios/     ← 5 archivos .md
src/content/casos/         ← casos de éxito
src/content/clientes/      ← los 18 clientes (nombre, sector, logo opcional)
src/content/blog/
src/content/paginas/       ← garantías, recursos
```

`empresa.ts` es la pieza central. Hoy el NAP no existe en el sitio; aquí existe **una sola vez** y se propaga a pie de página, `/contacto/`, JSON-LD y enlaces de WhatsApp. Cambiar el teléfono en un archivo lo cambia en todo el sitio, incluido el schema.

### Validación como control de calidad

Cada colección lleva esquema Zod con campos obligatorios. Si un servicio no tiene `metaDescription`, o una imagen no tiene `alt`, **la compilación falla y no se publica**.

Esto es la garantía estructural contra la reincidencia: hoy las 8 páginas carecen de meta description porque nada lo impedía.

### SEO y datos estructurados

Un componente `<SEO>` obligatorio en toda página genera title, meta description, canonical, Open Graph, `lang="es-CO"` y el JSON-LD correspondiente:

- `LocalBusiness` en todo el sitio, derivado de `empresa.ts`
- `Service` en cada página de servicio
- `BreadcrumbList` en la navegación
- `Article` en entradas de blog
- `FAQPage` donde haya preguntas frecuentes

Sitemap generado con `@astrojs/sitemap`. Las 301 se generan desde un mapa en código hacia el archivo `_redirects` de Cloudflare, no se escriben a mano.

### Imágenes y fuentes

`astro:assets` para conversión automática a WebP/AVIF, con `width` y `height` explícitos para evitar desplazamiento de diseño. Fuentes autoalojadas con `preload` y subset latino.

### Formularios y contacto

Web3Forms hacia `gerencia@mipc.com.co`, con honeypot antispam, validación en cliente y redirección a `/gracias/` — URL propia que permite medir la conversión en GA4, hoy imposible.

Los CTA de WhatsApp llevan mensaje precargado por servicio: quien escribe desde la página de CCTV llega con el asunto ya redactado.

### Errores

- Página 404 útil, con acceso a los cinco servicios y a WhatsApp
- Sin rutas de servidor, no hay errores 500 posibles

---

## 8. Pruebas

Cada prueba corresponde a un hallazgo de la auditoría que debe volverse irrepetible.

| Prueba | Hallazgo que impide |
|---|---|
| Verificador de enlaces rotos en cada build | CRIT-01, CRIT-06 (presentes en varias páginas, no solo la home) |
| Exactamente una `<h1>` por página | SEO-01 |
| `metaDescription` obligatoria vía Zod | SEO-02 |
| `alt` obligatorio en toda imagen | SEO-07 |
| Presupuesto de rendimiento en Lighthouse CI | DIS-04 |
| Validación de las 301 tras el corte | Pérdida de posiciones |
| `astro check` y TypeScript en CI | Regresiones de tipos |

El enlace roto del CTA principal lleva años en producción porque nada lo vigilaba. Con el verificador, un enlace roto rompe la compilación y no llega a publicarse.

---

## 9. Despliegue y corte de dominio

### Antes del corte

**Verificar Search Console mediante registro DNS TXT, cuanto antes.** No requiere acceso a WordPress y el DNS está bajo control propio. Sin línea base no hay forma de saber si la migración ayudó o perjudicó. Cada semana antes del corte suma línea base.

El sitio nuevo vive en su URL de `pages.dev` con `noindex` hasta el corte. Antes de cortar se guarda un inventario completo de las URLs actuales y su estado.

### Corte

1. Bajar el TTL del DNS a 300 s, 24–48 h antes
2. Desplegar y revisar en `pages.dev`
3. Apuntar el DNS a Cloudflare Pages; el certificado SSL se emite automáticamente
4. **No borrar el WordPress.** Se deja apagado pero recuperable durante 60 días
5. Ejecutar el verificador de las 301: cada URL vieja debe responder 301 hacia su destino, comprobada una por una

### Después del corte

Enviar el sitemap nuevo en Search Console y forzar la inspección de las páginas clave. Cuatro semanas de vigilancia sobre impresiones, posición media, páginas indexadas y errores de rastreo, contra la línea base.

**Umbral de alarma:** caída de impresiones superior al 20% sostenida durante dos semanas. Definido de antemano para evitar reaccionar a la fluctuación normal de los primeros días.

### Rollback

Revertir el DNS al WordPress, que sigue vivo. Con TTL de 300 s la reversión tarda minutos.

**Condición de ejecución:** pérdida de más del 40% de impresiones sostenida una semana, o fallo funcional que impida el contacto por WhatsApp o formulario y no pueda corregirse en 24 h.

### Expectativas

Dos semanas de fluctuación tras una migración son normales. El corte en sí **no sube posiciones**: lo que las mueve es el contenido nuevo, las cinco páginas de servicio, el reenfoque B2B y la ficha de Google Business Profile, con dos a tres meses de maduración. La migración deja de sabotear: corrige enlaces rotos, móvil, idioma, schema y velocidad.

---

## 10. Fuera de alcance

Lo siguiente queda explícitamente fuera de este proyecto, para evitar que se expanda:

- **Google Business Profile.** Es la palanca de mayor retorno de la auditoría pero se gestiona fuera del sitio. Debe hacerse en paralelo, sin esperar al lanzamiento.
- Páginas por zona geográfica
- Panel de administración con CMS
- Tienda o comercio electrónico
- Migración del correo o de otros servicios de Hostinger
- Rediseño del logo

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| Pérdida de posiciones tras el corte | 301 verificadas una por una, línea base en Search Console, rollback por DNS con TTL bajo |
| Los 6 logos faltantes no se consiguen | Van como nombre en texto en la misma retícula. Con el permiso de nombrar clientes confirmado, esto es una decisión de diseño válida y no una degradación |
| Las 4 fotos pendientes no se toman | Componentes con imagen opcional; sustitutos definidos |
| El sitio vuelve a quedar sin dueño | Sin plugins ni PHP que actualizar, un sitio estático no se degrada ni se compromete por abandono |
| Redacción B2B pendiente de aprobación | Se redactan borradores para revisión del cliente, no se publica sin visto bueno |

---

## 12. Decisiones resueltas por el cliente

Confirmadas el 2026-08-14, sin pendientes abiertos.

- **«Pack Office» se retira de `/recursos/`.** La página nueva lleva cuatro entradas: AnyDesk, DeskIn, CrystalDiskInfo y el comando de UUID. No se migra la quinta entrada ni su enlace.

### `/recursos/` deja de servir instaladores propios

Al verificar la página se encontró que **las cinco descargas apuntan a archivos alojados en MEGA**, no a los sitios oficiales de cada fabricante. La página nueva cambia ese modelo: **cada herramienta enlaza a su página de descarga oficial** (anydesk.com, deskin.io, crystalmark.info), y el comando de UUID se muestra como texto copiable en vez de como descarga.

Tres razones, en orden de importancia:

1. **Confianza B2B.** Distribuir instaladores de terceros desde un MEGA propio es el patrón que usa la distribución de malware. Un responsable de TI corporativo lo nota, y es justo el cliente que este proyecto busca.
2. **Versiones.** Los archivos en MEGA envejecen; los enlaces oficiales sirven siempre la versión vigente y parcheada.
3. **Cero mantenimiento**, que es el criterio rector de todo el proyecto.

Como efecto secundario, esto convierte `/recursos/` en una página legítimamente útil y enlazable, en lugar de un repositorio de archivos.
- **Hay permiso para nombrar clientes.** Los casos de éxito usan nombres reales, el muro de clientes puede llevar los nombres en texto junto a los logos, y la foto 04 (Belén Arrendamientos) es utilizable.

Esto último tiene una consecuencia de diseño que conviene explotar: los seis logos faltantes dejan de ser un problema. Un muro que combina logo y nombre en texto es coherente por diseño, no un remiendo — y el nombre en texto es además indexable, cosa que un logo no es.
