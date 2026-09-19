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

**Search Console tampoco tiene ningún sitemap enviado explícitamente.** No es
grave: Google lo descubre por la línea `Sitemap:` de `robots.txt`, y la
indexación del sitio lo demuestra. Pero enviarlo a mano es gratis y queda
**pendiente**.

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

1. **Volver en 48 horas.** Bing avisa de que los datos tardan hasta dos días:
   Search Performance está vacío. Hay que mirar entonces consultas, posiciones
   y si el sitemap se rastreó sin errores.
2. **Enviar el sitemap también en Search Console**, que no lo tiene.
3. **Correr `indexnow.mjs` después de cada despliegue** que publique o cambie
   páginas. No está automatizado a propósito: el build corre en Cloudflare,
   antes de que el sitio esté vivo, y automatizarlo ahí sería anunciar lo que
   todavía no se sirve.
4. **Las URL de spam ruso del WordPress viejo.** Unas veinte rutas de
   2021–2022 sobre casinos y apuestas aparecen todavía como páginas de entrada
   en GA4. Hoy responden 404, que es lo correcto. Falta comprobar si Google o
   Bing las conservan indexadas bajo este dominio.
