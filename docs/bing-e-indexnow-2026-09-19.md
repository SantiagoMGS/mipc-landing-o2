# Bing e IndexNow — puesta en marcha y primera lectura

**Fecha:** 2026-09-19
**Método:** Bing Webmaster Tools por navegador, con la cuenta de Google de
`santiago.martinez@mipc.com.co`. IndexNow verificado desde la terminal.

## Por qué Bing, si el tráfico está en Google

Porque **ChatGPT se apoya en el índice de Bing**, y el 2026-09-19 se confirmó
que ese canal existe: 8 sesiones de `chatgpt.com / ai-assistant` en tres
semanas, con una clienta que lo contó de viva voz. Ver
`medicion-ga4-asistentes-ia-2026-09-19.md`.

La consecuencia práctica no es «hay que posicionarse en Bing para ganar
tráfico de Bing» —ese tráfico es marginal en Colombia—. Es otra: **si Bing
tarda dos semanas en ver una página nueva, el asistente tarda dos semanas en
poder citarla.** La velocidad del índice de Bing es la velocidad a la que una
página nueva puede aparecer en una recomendación de ChatGPT.

## El estado que había

**Bing Webmaster Tools nunca se había configurado.** Cuenta vacía, sin sitios.

El sitio se importó desde Search Console —la vía que evita volver a verificar
el dominio, porque reutiliza la verificación que Google ya tiene—. La
importación reveló de paso algo de Google:

> **Total Sitemaps found: –** · **Sitemaps Count: 0**

De eso se concluyó que Search Console tampoco tenía sitemap enviado. **Era
falso.** Comprobado por API el 2026-09-21:

```
path: https://mipc.com.co/sitemap-index.xml
lastSubmitted: 2026-08-17    lastDownloaded: 2026-09-20
warnings: 0                  errors: 0
```

Estaba enviado desde el día siguiente al corte y Google lo descarga con
normalidad. **El cero era de la importación de Bing, no de Google**: la
importación no lo recogió, por el motivo que sea, y se leyó como un hueco en
Google que no existía.

La lección, que es la misma de otras veces en este repositorio: **un cero en la
herramienta A sobre los datos de la herramienta B es una afirmación sobre A.**
Antes de apuntarlo como pendiente había que preguntárselo a B, que aquí
costaba una llamada a la API.

*(Nota sobre esa misma respuesta: el campo `contents.indexed` viene en `0`. No
significa nada — es un campo que Google dejó de mantener. La inspección de URL
confirma que hay páginas indexadas.)*

### Coste de la importación, para que conste

Importar desde Search Console concede a Microsoft **acceso de solo lectura
permanente** a la Search Console de la cuenta, no una lectura única: lo usa
para revalidar la verificación y actualizar sitemaps de forma periódica. Es
revocable en `myaccount.google.com` → Seguridad → Conexiones con terceros.

La alternativa —verificar el dominio a mano con un archivo en `public/`— no
concedía nada y costaba un commit. Se eligió la importación a sabiendas.

## Lo que se comprobó

Inspección de URL sobre `/servicios/camaras-de-seguridad/`:

- **Indexed successfully** — la URL puede aparecer en Bing.
- **No SEO/GEO issues found** — Bing ya trae su propia comprobación de GEO.
- **1 Markup type found: JSON-LD.**

Sobre lo último, para que nadie se alarme releyendo esto: «markup type» es el
**formato**, no el número de esquemas. Que diga 1 no significa que Bing vea
solo uno de los cuatro tipos que emite esa página; significa que los encuentra
en JSON-LD. No hay nada que arreglar ahí.

**Conclusión: la base estaba bien.** El canal que trajo a la clienta no
dependía de la suerte. Lo que faltaba era avisar cuando se publica.

## Rendimiento con IA: cero, y por qué no dice lo que parece

La pestaña **AI Performance** da **0 citaciones y 0 páginas citadas en tres
meses**.

**Eso NO significa que los asistentes no te citen.** Esa pestaña mide
«Microsoft Copilots and Partners». ChatGPT usa el *índice* de Bing pero su
propio criterio para decidir a quién cita, y no reporta aquí. GA4 ya demostró
que ChatGPT sí está citando el sitio.

La lectura correcta es estrecha: **Copilot nunca ha citado a MiPC.** Nada más.

## Lo que quedó montado: IndexNow

`scripts/indexnow.mjs`. Anuncia URL a Bing en lugar de esperar al rastreo.
Google no tiene nada equivalente.

```bash
node scripts/indexnow.mjs                       # todo el sitemap construido
node scripts/indexnow.mjs /rionegro/            # solo esas rutas
node scripts/indexnow.mjs --simulacro           # enseña qué enviaría
```

Primera ejecución del 2026-09-19: **35 URL anunciadas, respuesta 202.**

### Dos decisiones del diseño

**La clave se deduce del archivo publicado, no se escribe en el código.**
IndexNow prueba la propiedad del dominio pidiendo que la clave esté publicada
en la raíz: `public/<clave>.txt`, cuyo contenido tiene que ser su propio
nombre. Es pública por definición y va versionada. Si la clave estuviera
además escrita en el script, podrían contradecirse, y el síntoma sería un
`403` que no explica nada.

**Los tests la comprueban en el build, no al anunciar.** `tests/indexnow.test.ts`
verifica que haya exactamente una clave, que el archivo contenga su propio
nombre, que llegue a `dist/` y que `robots.txt` no la bloquee. El script se
corre a mano y a veces tarde; los fallos que importan —renombrarla, editarla,
dejar dos al rotar— tienen que salir **antes de desplegar**.

### Cuándo se corre

**Después de desplegar, nunca antes.** IndexNow verifica la clave pidiéndosela
al sitio en vivo, y anuncia URL que el buscador irá a leer. Anunciar lo que
todavía no está publicado hace que el buscador lea la versión vieja: el aviso
se gasta para nada. Es la misma regla que `check-redirecciones.mjs`.

### Rotar la clave

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

El archivo nuevo va en `public/` y **el viejo se borra en el mismo commit**:
el test exige que haya exactamente una, justo para que no quede el estado a
medio rotar.

## Lo que NO se puede concluir

- **Que esto traerá tráfico de Bing.** La cuota de Bing en Colombia es
  pequeña. El valor está en la velocidad del índice, no en sus visitantes.
- **Que anunciar sea indexar.** IndexNow pide que vayan a mirar. El buscador
  decide si va, cuándo y si indexa.
- **Que cero citaciones de Copilot sea un diagnóstico del sitio.** Es una
  medida de un producto concreto sobre una base de tres meses.

## Pendiente

1. **Volver otra vez.** A las 48 horas —comprobado el 2026-09-21— tres de las
   cuatro secciones siguen vacías. Ver el apartado siguiente.
2. ~~Enviar el sitemap también en Search Console.~~ **Ya estaba enviado**; ver
   arriba.
3. **Correr `indexnow.mjs` después de cada despliegue** que publique o cambie
   páginas. No está automatizado a propósito: el build corre en Cloudflare,
   antes de que el sitio esté vivo, y automatizarlo ahí sería anunciar lo que
   todavía no se sirve.
4. **Los enlaces que apuntan a las URL de spam.** Ver el apartado siguiente:
   las URL no están indexadas, pero algo sigue pidiéndolas. La sección de
   Backlinks de Bing lo diría y está vacía hasta que pasen las 48 horas.

## Las URL de spam del WordPress viejo: resueltas

Unas veinte rutas de 2021–2022 sobre casinos y apuestas —`/2022/02/25/как-взять-деньги-у-1xbet…`—
seguían apareciendo como páginas de entrada en GA4. Confirman que **el
WordPress estuvo comprometido** y sirvió esas páginas bajo el dominio de MiPC.

**No están indexadas. Ni en Google ni en Bing.** Comprobado el 2026-09-19:

| Buscador | Método | Resultado |
|---|---|---|
| Google | API de inspección de URL, las 19 | `URL is unknown to Google` |
| Google | URL de control `/servicios/camaras-de-seguridad/` | `Submitted and indexed` |
| Bing | Inspección de URL en Webmaster Tools | `Not discovered` |

La URL de control importa: sin ella, un «desconocida» en las diecinueve podría
significar que la medición no funciona, no que las URL no estén.

### El paso que casi invalida la comprobación

Las rutas que devuelve GA4 **parecen cortadas a mitad de palabra**
(`…как-взять-в-долг-на-1xbe`). Si el corte fuera de GA4, preguntarle a Google
por una URL incompleta daría «desconocida» siempre y la respuesta no valdría
nada.

No lo es. Las longitudes percent-encoded se apiñan entre **202 y 211
caracteres**, doce de diecinueve entre 207 y 211. Restando el prefijo de fecha
—`/2022/02/25/`, doce caracteres— quedan **199**: el límite de `post_name` en
WordPress, que es `VARCHAR(200)`.

**Las cortó WordPress al crearlas.** Son las URL reales y completas.

Regla general que deja este caso: **antes de concluir de una medición, hay que
comprobar que el dato de entrada no viene mutilado por la herramienta que lo
entregó.** GA4 trunca rutas largas; aquí dio la casualidad de que no.

### Quién las sigue pidiendo

Origen de esas 20 sesiones, sin excepción:

| | |
|---|---|
| Fuente | `(direct)` — 20 |
| País | **Singapur** — 20 |
| Navegador | Chrome — 20 |

Un único origen, un único país, sin referente: **un rastreador automatizado
desde un centro de datos**, trabajando sobre una lista vieja de URL de las que
circulan entre redes de spam. No son personas ni buscadores.

### Qué hacer: nada

Las URL responden 404, que es la respuesta correcta para algo que ya no existe.

**Redirigirlas sería peor.** Convertiría un 404 limpio —«esto no existe»— en un
301 —«esto se mudó aquí»—, que es afirmar que las páginas de casinos son
antecesoras legítimas de las de MiPC. Si alguien propone «arreglarlas» en el
futuro, esta es la razón de no hacerlo.

Lo único que queda abierto es si existen **enlaces externos** apuntando a esas
rutas, que es lo que explicaría que un rastreador las conserve en su lista.
Eso se mira en Backlinks cuando Bing termine de procesar.

## Revisión a las 48 horas (2026-09-21)

### Lo que ya responde, y es el resultado que importa

**`/rionegro/`, publicada el 2026-09-19, está indexada en Bing y sigue siendo
desconocida para Google.**

| | Bing | Google |
|---|---|---|
| `/rionegro/` | `Indexed successfully` · sin problemas de SEO/GEO · 2 tipos de marcado | `URL is unknown to Google` |

Dos días para entrar en un índice y no en el otro. Como el sitio nuevo tarda en
ser citable por un asistente lo que tarda Bing en verlo, esto es exactamente lo
que se quería.

**Lo que NO se puede afirmar: que fuera IndexNow.** El mismo 2026-09-19 se
enviaron a Bing dos cosas —el sitemap y el aviso de IndexNow— y Bing pudo haber
llegado por cualquiera de las dos. Los mecanismos no se pueden separar con este
dato. Lo que sí queda medido es el resultado: **Bing dos días, Google más de
dos.**

### Lo que sigue sin responder

| Sección | Estado a las 48 h |
|---|---|
| Search Performance | «Please check back in 48 hours» |
| Backlinks | `No data available` |
| Site Explorer | `No data available` |
| AI Performance | funcionaba desde el primer día (0 citaciones) |
| URL Inspection | funciona desde el primer día |

El patrón: **lo que consulta el índice en vivo responde ya; lo que son informes
agregados necesita más tiempo del anunciado.** Así que la pregunta de los
enlaces de spam sigue abierta, y hay que volver.

### El sitemap, y un susto que no era

Bing lo rastreó el 2026-09-19 con estado `Success`, 0 errores y 0 avisos. La
columna **«URLs discovered» marca 1**, que a primera vista parece que no
expandió nada.

**No es un fallo.** Esa fila es de tipo `Sitemap Index`, y el 1 son sus
sitemaps hijos: `sitemap-index.xml` apunta a un único `sitemap-0.xml`, que
contiene las 35 URL. Comprobado en `dist/`.

*(Con un tropiezo por el camino: un `grep -c '<loc>'` sobre el hijo devolvía 1,
porque el XML de Astro va todo en una sola línea y `-c` cuenta líneas, no
apariciones. Es `grep -o … | wc -l`. Vale la pena recordarlo antes de declarar
rota una medición.)*

### IndexNow en el panel: no muestra nada, y da igual

La sección IndexNow sigue enseñando la página de bienvenida con «Get Started»,
sin estadísticas de envíos. **No significa que los avisos fallaran**: la API
respondió `202` y `/rionegro/` está indexada. El panel parece reportar solo las
claves generadas desde ahí, y la nuestra se generó en el repositorio, que es la
forma que el protocolo contempla.

No hay que «activar» nada allí. Si algún día hiciera falta comprobar un envío,
lo que vale es la respuesta de la API y la inspección de la URL.
