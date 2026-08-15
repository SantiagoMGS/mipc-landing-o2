# Despliegue y corte de dominio: mipc.com.co

Este documento transcribe los pasos de despliegue y corte de dominio que **no**
se pueden ejecutar desde este repositorio: requieren las cuentas propias del
cliente (Cloudflare, Google, Hostinger) y control del DNS de `mipc.com.co`.
Ningún agente automatizado los ejecutó. Quien haga el corte real debe seguir
esta lista en orden.

## Antes de cualquier otra cosa: el comando de build

**El proyecto de Cloudflare Pages debe configurarse con el comando de build
`npm run build`, nunca `astro build` directamente.**

La razón no es una preferencia de estilo: el hook `prebuild` de npm
(`scripts/generar-redirecciones.mjs`) es quien escribe `public/_redirects` a
partir de `src/data/redirecciones.ts` en cada build. Ese archivo está en
`.gitignore` — no existe en el repositorio, solo se genera. Si Cloudflare Pages
invoca `astro build` en lugar de `npm run build`, el hook `prebuild` nunca se
ejecuta, `public/_redirects` no se genera, y el sitio se publica con **cero
redirecciones**. Eso descarta en silencio las 14 URLs de WordPress que hoy
tienen posicionamiento en buscadores: quien llegue por un enlace o resultado
viejo recibirá un 404 en vez de un 301 a la página nueva.

Configuración correcta en Cloudflare Pages:
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Variable de entorno:** `PUBLIC_WEB3FORMS_KEY`

## Paso 1: Crear el proyecto en Cloudflare Pages

- [ ] Crear el proyecto en Cloudflare Pages conectado al repositorio.
- [ ] Build command `npm run build` (ver advertencia arriba, no `astro build`).
- [ ] Build output directory `dist`.
- [ ] Añadir la variable de entorno `PUBLIC_WEB3FORMS_KEY` con la clave real de Web3Forms.

## Paso 2: Impedir la indexación mientras el sitio vive en pages.dev

`public/_headers` ya incluye la regla de `noindex` para el subdominio de
`pages.dev`:

```
https://PROYECTO.pages.dev/*
  X-Robots-Tag: noindex
```

**`PROYECTO` es un marcador de posición.** Antes de confiar en esta regla,
reemplazarlo por el nombre real que Cloudflare Pages asigne al proyecto (el
que aparece en la URL `https://<nombre-real>.pages.dev`). Si el nombre no
coincide exactamente, la regla no aplica a ninguna URL real y el sitio de
staging queda indexable por accidente.

- [ ] Verificar que el subdominio en `public/_headers` coincide con el proyecto real de Cloudflare Pages.
- [ ] Confirmar con una petición real (`curl -I https://<proyecto>.pages.dev/`) que la cabecera `X-Robots-Tag: noindex` se sirve.

## Paso 3: Revisar en pages.dev antes de cortar

En un móvil real, contra la URL de `pages.dev`:

- [ ] No hay desbordamiento horizontal en ninguna página (regresión CRIT-02).
- [ ] El formulario de contacto envía y confirma en `/gracias/`.
- [ ] El botón de WhatsApp abre con el mensaje precargado.
- [ ] Los enlaces de las tarjetas de servicio llevan a su página correspondiente (regresión CRIT-01).

## Paso 4: Lista de verificación previa al corte

- [ ] Horario de atención confirmado con el cliente y **coincidente con Google Business Profile**. `src/data/empresa.ts` lo deja marcado como pendiente de confirmar.
- [ ] Google Business Profile creado con la dirección de Laureles (Carrera 66A # 34-48, Interior 101).
- [ ] Search Console verificado por registro DNS TXT en `mipc.com.co`, con línea base de impresiones/clics acumulada antes del corte (para poder comparar después).
- [ ] GA4 instalado y registrando la visita a `/gracias/` como conversión.
- [ ] `npm run verify` en verde (ver estado en el informe de la Tarea 17).
- [ ] Inventario de las URLs actuales del sitio en WordPress guardado (capturas o export del sitemap), por si hace falta comparar después del corte.
- [ ] TTL del DNS de `mipc.com.co` bajado a 300 s, 24-48 horas antes del corte.

## Paso 5: Ejecutar el corte

- [ ] Apuntar el DNS de `mipc.com.co` a Cloudflare Pages.
- [ ] Retirar la regla de `noindex` de `public/_headers` (o eliminar el archivo, o eliminar solo esa línea) y volver a desplegar — un dominio de producción con `X-Robots-Tag: noindex` no aparece en buscadores aunque el resto del SEO esté perfecto.
- [ ] **No borrar el WordPress.** Apagarlo pero mantenerlo recuperable durante 60 días, por si algo del corte falla y hay que volver atrás.

## Paso 6: Verificar las redirecciones en producción

Correr, ya con el dominio en vivo apuntando al sitio nuevo:

```bash
node --experimental-strip-types scripts/check-redirecciones.mjs https://mipc.com.co
```

Se espera: las 14 redirecciones definidas en `src/data/redirecciones.ts`
responden 301 al destino correcto. Este comando **no se puede ejecutar antes
del corte** — apunta a `https://mipc.com.co`, que hasta el corte sigue sirviendo
el WordPress viejo, así que correrlo antes no prueba nada sobre el sitio nuevo.

- [ ] Ejecutar el comando anterior contra el dominio real, después del corte.
- [ ] Si alguna redirección falla, no continuar con el paso 7 hasta corregirla.

## Paso 7: Enviar el sitemap y arrancar la vigilancia

- [ ] Enviar `https://mipc.com.co/sitemap-index.xml` en Google Search Console.
- [ ] Inspeccionar manualmente las páginas clave (home, cada servicio, contacto) en Search Console para forzar su rastreo.
- [ ] Vigilar cuatro semanas seguidas contra la línea base de impresiones/clics capturada en el Paso 4.
- [ ] **Umbral de alarma:** una caída de impresiones superior al 20 % sostenida durante dos semanas seguidas. Si ocurre, revisar redirecciones, canonical y cobertura de indexación antes de asumir que es estacional.

---

## Qué SÍ se hizo desde el repositorio (Tarea 17)

- Las 12 fotografías seleccionadas, descargadas, recortadas donde hacía falta y
  colocadas con `<Figura>` y `alt` descriptivo en las páginas de servicio y en
  «Nosotros».
- La clase `.foto-tratada` en `global.css`, aplicada en `Figura.astro`.
- `public/robots.txt`.
- `public/_headers` con la regla de `noindex` para `pages.dev` (pendiente de
  ajustar el nombre real del proyecto, ver Paso 2).
- Este documento.

Ver `.superpowers/sdd/2026-08-14-mipc-astro/task-17-report.md` para el detalle
completo: dimensiones de cada fotografía, qué contenía el recorte de la foto
17, dónde quedó cada imagen, resultado de `npm run verify` y peso del build
antes/después.
