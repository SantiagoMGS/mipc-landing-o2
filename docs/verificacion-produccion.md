# Verificación de producción tras el corte de dominio

Medición hecha el **2026-08-16** contra `https://mipc.com.co/` **en vivo desde
internet**, ya con la versión nueva sirviendo el dominio. No contra una
compilación local ni contra el subdominio de pruebas.

Todo lo de este documento está **medido**. Donde hay una interpretación o una
recomendación que no se sigue directamente de una medición, lo dice
explícitamente. Cada bloque lleva el comando que lo produjo, para que se pueda
repetir.

Método:

- Códigos de estado, cabeceras y `robots.txt`: `curl` desde la línea de comandos.
- Redirecciones heredadas: `node scripts/check-redirecciones.mjs https://mipc.com.co`.
- Peso, tiempos, desborde y métricas de experiencia: Chrome con **emulación de
  dispositivo real** (`isMobile: true`, 390 × 844, DPR 3, agente de iPhone). Es
  la distinción que importa: lanzar Chrome con `--window-size=390` **sin**
  `isMobile` compone a ancho de escritorio y recorta, que fue el error de método
  que produjo un hallazgo falso en la auditoría anterior.

---

## 1. El resultado que importaba: las 17 redirecciones

```
node scripts/check-redirecciones.mjs https://mipc.com.co
→ Las 17 redirecciones responden correctamente
```

**Las diecisiete direcciones del WordPress antiguo responden `301` hacia su
destino correcto.** El script comprueba dos cosas por separado, no una: que el
código sea exactamente `301` (no `302`, que no transfiere autoridad) y que
`new URL(destino, base).pathname` coincida con la ruta esperada.

Era el único riesgo del proyecto que **no admitía ensayo previo**: hasta que el
dominio no apuntara a Cloudflare, no había forma de comprobarlo. O funcionaba el
día del corte, o se descubría semanas después viendo caer el tráfico.

Funciona. El posicionamiento acumulado se transfiere en lugar de perderse.

Y el mapa del sitio, completo:

```
30 URLs comprobadas, 0 con problema      # todas 200
```

---

## 2. Comprobaciones que salen correctas

| Comprobación | Resultado medido |
|---|---|
| Redirecciones heredadas | 17 / 17 → `301` al destino correcto |
| Mapa del sitio | 30 / 30 → `200` |
| Producción indexable | sin `X-Robots-Tag`, sin `<meta name="robots">` |
| Subdominio de pruebas fuera del índice | `x-robots-tag: noindex` presente |
| `/gracias/` | `<meta name="robots" content="noindex,follow">` |
| URL inexistente | `404` real, **no** un `200` con página de error |
| Desborde horizontal en móvil | `scrollWidth` 390 = `innerWidth` 390, en todas |
| Datos estructurados | `LocalBusiness` completo (§4) |
| Duplicado `www` | canónica apunta a `https://mipc.com.co/` |

Dos de estas merecen comentario.

**El `noindex` del sitio de pruebas no se filtró a producción.** Era el fallo
silencioso más peligroso del corte: las reglas de `public/_headers` están
acotadas por host y ninguna coincide con `https://mipc.com.co/*`. Comprobado en
las dos direcciones — producción sin cabecera, `workers.dev` con ella. De paso,
esto **demuestra que el archivo `_headers` se está aplicando**, lo que hace que
los huecos del §5 sean responsabilidad nuestra y no de la plataforma.

**El 404 devuelve 404.** Un sitio estático mal configurado sirve la página de
error con código `200`, y Google indexa cientos de páginas vacías. Comprobado
con una ruta inventada (`/esto-no-existe-jamas/`) y con un slug erróneo
(`/servicios/soporte-ti/`, cuando el real es `soporte-ti-empresarial`): las dos
devuelven `404`.

---

## 3. Métricas de experiencia

Portada, móvil emulado, red real:

| Métrica | Medido | Umbral «bueno» de Google |
|---|---|---|
| LCP | **252 ms** | 2.500 ms |
| CLS | **0,000** | 0,1 |
| FCP | **252 ms** | 1.800 ms |
| TTFB (navegación) | **78 ms** | 800 ms |
| TTFB (en frío, con DNS + TLS) | 227 ms | — |

El elemento LCP es una imagen (`IMG`) y coincide con el FCP: lo primero que se
pinta es ya lo más grande, que es el comportamiento ideal.

Cloudflare responde con `CF-Cache-Status: HIT` y `CF-RAY` en Miami, el nodo más
cercano a Medellín de los que tiene la cuenta.

> **Interpretación, no medición:** estos números salen de una sola ejecución
> desde una conexión concreta. Los datos de campo reales (usuarios de verdad,
> redes móviles colombianas de verdad) tardan unas semanas en aparecer en
> CrUX y en Search Console. Lo que sí es estructural y no depende de la red es
> el CLS de 0,000 y que no haya JavaScript de terceros bloqueando.

---

## 4. Datos estructurados servidos en producción

Un solo bloque JSON-LD en la portada, `LocalBusiness`, con:

```
name        MiPC Tecnología
telephone   +573148889078
taxID       901401211-7
priceRange  $$
geo         6.240407, -75.586452
hasMap      https://www.google.com/maps?cid=15154712519055002689
dir         Carrera 66A # 34-48, Interior 101 — Medellín
horario     6 días declarados
```

El `hasMap` apunta al **CID real** de la ficha de Google Business, no a una
búsqueda por texto. Eso es lo que enlaza la entidad del sitio con la entidad de
Google Maps de forma inequívoca, que era el objetivo del §4 del diagnóstico
anterior. El `taxID` con el NIT cumple la misma función frente a las empresas de
nombre parecido.

---

## 5. Lo que hay que corregir

Ordenado por impacto real. **Ninguno rompe nada.** Los dos primeros son de una
línea cada uno en archivos que ya existen y ya funcionan.

### 5.1 — Alto. La caché está desactivada para archivos que nunca cambian

Todo lo que vive en `/_astro/` lleva un hash de su contenido en el nombre:

```
Base.L4TEFPoi.css
archivo-latin-standard-normal.DY7AcnAa.woff2
```

Si el contenido cambia, cambia el nombre. Son **inmutables por construcción**.
Aun así se sirven con:

```
Cache-Control: public, max-age=0, must-revalidate
```

Cada visita repetida y cada salto entre páginas vuelve a pedir validación de los
mismos archivos: 44 KB de CSS y 117 KB de tipografías, entre otros. El visitante
que llega por primera vez no lo nota; el que navega por el sitio, sí.

**Arreglo** — en `public/_headers`:

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

Es seguro precisamente porque el nombre cambia cuando cambia el contenido: no
existe el caso de «el usuario se quedó con la versión vieja».

### 5.2 — Alto. `http://` sirve el sitio sin llevar a `https://`

```
http://mipc.com.co/       → 200   (sirve la página, no redirige)
http://www.mipc.com.co/   → 200
```

Y no hay `Strict-Transport-Security`, así que nada le indica al navegador que
use HTTPS la próxima vez. Quien llegue desde un enlace antiguo escrito con
`http://` navega sin cifrar, y el formulario de contacto viaja igual.

**Arreglo, en dos partes:**

1. Activar **Always Use HTTPS** en Cloudflare → SSL/TLS → Edge Certificates.
   Es un interruptor del panel y **hay que hacerlo desde la cuenta del cliente**.
2. Añadir HSTS en `public/_headers` (ver 5.3).

### 5.3 — Medio. No hay ninguna cabecera de seguridad

Comprobadas seis, ausentes las seis: `Strict-Transport-Security`,
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
`Content-Security-Policy`, `Permissions-Policy`.

Para un sitio estático sin sesiones ni datos de usuario el riesgo real es bajo.
El argumento a favor de ponerlas no es defensivo, es comercial: es lo que revisa
cualquier cliente corporativo que audite a su proveedor de TI, que es
exactamente el público al que apunta este sitio.

**Arreglo** — en `public/_headers`:

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
```

> **Cuidado con `includeSubDomains`:** obliga a HTTPS en *todos* los subdominios,
> incluido `app.mipc.com.co` y cualquiera que sirva correo por web. Confirmar que
> todos tienen certificado válido antes de desplegarlo, porque el navegador lo
> recuerda durante un año.

### 5.4 — Medio. 248 KB de logotipos en PNG en la portada

Veinte archivos PNG suman **248 KB**, casi un tercio de los 767 KB de la
portada:

```
  25 KB  /logos/mix-fm.png
  19 KB  /logos/la-paisana.png
  19 KB  /logos/ie-el-pedregal.png
  18 KB  /logos/radio-tiempo.png
  17 KB  /logos/ips-ser-integral.png
  ...
```

Todas las fotografías del sitio ya están en WebP. Los logotipos son lo único que
quedó fuera, porque se sirven desde `public/` y no pasan por el pipeline de
imágenes de Astro.

**Arreglo:** moverlos a `src/assets/` y servirlos con el componente `<Image>`,
como el resto. **Estimación, no medición:** en WebP deberían quedar cerca de
50 KB en total.

Este punto lleva señalado desde antes del lanzamiento y sigue pendiente.

### 5.5 — Medio. Una sola foto de proyecto pesa 378 KB

Peso por página de proyecto, móvil:

| Página | Total | Recurso mayor |
|---|---:|---:|
| `/proyectos/los-panes/` | **764 KB** | **378 KB** — `los-panes-instalacion-alero` |
| `/proyectos/tous-arkadia/` | 440 KB | 141 KB |
| `/proyectos/centro-comercial-oviedo/` | 431 KB | 113 KB |
| `/proyectos/global-la-estrella/` | 427 KB | 177 KB |
| `/proyectos/obra-tablaza/` | 420 KB | 202 KB |
| … | | |
| `/proyectos/video-portero-laureles/` | 228 KB | 88 KB (tipografía) |

Es un caso aislado, no un problema del sistema: el original entró con más
resolución de la que la página necesita, y la recompresión a WebP conserva lo
que le den. El resto está en un rango sano.

**Arreglo:** reducir el original antes de que Astro lo procese.

### 5.6 — Bajo. `www` responde 200 en vez de redirigir

`https://www.mipc.com.co/` entrega el sitio completo en lugar de un `301` al
dominio sin `www`.

En la práctica no hace daño: la canónica de esas páginas apunta a
`https://mipc.com.co/` y Google consolida las dos versiones. Pero lo correcto es
el `301`, que resuelve la duplicidad sin depender de que el buscador haga caso a
una señal que es una sugerencia, no una orden.

**Arreglo** — en `public/_redirects`:

```
https://www.mipc.com.co/*  https://mipc.com.co/:splat  301
```

### 5.7 — Informativo. `mipctecnologia.com` lleva a la aplicación

```
https://mipctecnologia.com/  → 302  https://app.mipc.com.co/
```

Un `302` es temporal y no transfiere autoridad, así que si ese dominio tuvo
alguna vez enlaces o menciones, no están sumando a nada.

Puede ser deliberado — es plausible que se use como atajo para entrar a la
aplicación. Por eso queda como dato y no como defecto. **Decisión del cliente:**
si ya no se usa para eso, conviene un `301` a `mipc.com.co`; si sí se usa,
déjese como está.

---

## 6. El `robots.txt` que sirve Cloudflare

Cloudflare **antepone un bloque gestionado propio** al `robots.txt` del
repositorio. El archivo que se sirve no es el que está en `public/robots.txt`;
es el nuestro con un prefijo añadido.

El bloque de Cloudflare deniega el paso a `GPTBot`, `ClaudeBot`,
`Google-Extended`, `CCBot`, `Bytespider`, `Amazonbot`, `Applebot-Extended` y
`meta-externalagent`, y declara `Content-Signal: search=yes, ai-train=no,
use=reference`.

**Esto no afecta al posicionamiento.** Son rastreadores de *entrenamiento* de
modelos, no de búsqueda:

- `Google-Extended` **no es** `Googlebot`. Bloquearlo no toca el índice de
  Google Search.
- Los rastreadores que alimentan las respuestas con IA — `OAI-SearchBot`,
  `ChatGPT-User` — **no están** en la lista de bloqueo.
- `search=yes` concede explícitamente el uso para indexación.

Y nuestras dos líneas sobreviven al final del archivo:

```
User-agent: *
Allow: /

Sitemap: https://mipc.com.co/sitemap-index.xml
```

El mapa del sitio sigue declarado. No hay nada que hacer aquí; queda documentado
porque `public/robots.txt` y lo que se sirve **no coinciden**, y quien lo compare
en el futuro va a pensar que algo se rompió.

---

## 7. Orden de trabajo recomendado

1. **Hoy, sin tocar el panel** — cabeceras de caché y seguridad (5.1 y 5.3) y el
   `301` de `www` (5.6). Todo cabe en `public/_headers` y `public/_redirects`, y
   se despliega solo con el siguiente `push`.
2. **Hoy, desde la cuenta de Cloudflare** — activar *Always Use HTTPS* (5.2).
   Requiere acceso al panel.
3. **Esta semana** — logotipos a WebP (5.4) y reducir la foto de Los Panes (5.5).
4. **En dos o tres semanas** — revisar Search Console. Las redirecciones
   responden bien hoy; lo que falta por confirmar es que Google recorra las URL
   nuevas y retire las viejas del índice. Ahí es donde se ve si el traspaso se
   consolidó de verdad, y ninguna medición del día del corte puede anticiparlo.

---

## 8. Sigue pendiente de decisión del cliente

**Google Ads.** Para dar una recomendación que valga algo hacen falta tres
cifras que solo el cliente tiene: valor anual de un cliente corporativo, qué
porcentaje de cotizaciones se acaban cerrando, y cuántos clientes nuevos entran
al mes. Sin ellas, cualquier recomendación sería una corazonada disfrazada de
análisis.

Lo que sí está listo es la instrumentación: el evento de conversión, la captura
de `gclid`/`wbraid`/`gbraid` y los clics de WhatsApp y teléfono ya están
medidos, así que el día que se decida invertir no hay que esperar a instalar
nada.
