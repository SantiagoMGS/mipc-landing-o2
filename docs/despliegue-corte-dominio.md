# Despliegue y corte de dominio: mipc.com.co

> ## ✅ EL CORTE SE EJECUTÓ EL 2026-08-16
>
> `mipc.com.co` sirve el sitio nuevo desde Cloudflare Workers. Lo de abajo
> deja de ser un plan y pasa a ser dos cosas: **el registro de lo que pasó de
> verdad** (esta sección y la siguiente) y **el runbook original**, que se
> conserva porque la mayoría sigue siendo válida y porque hay que repetirlo el
> día que se mueva otro dominio.
>
> | | |
> |---|---|
> | Plataforma | Cloudflare **Workers** con assets estáticos, proyecto `mipc-landing-o2` |
> | Nameservers | `adi.ns.cloudflare.com` · `yahir.ns.cloudflare.com` |
> | Registro del dominio | Hostinger, vence 2027-07-14, autorrenovación activa |
> | Rollback | Volver a `ns1.dns-parking.com` y `ns2.dns-parking.com` en Hostinger. **La zona sigue ahí: no borrarla** |
> | Zona de referencia | `docs/dns/zona-mipc.com.co-2026-08-16.txt` |
>
> **Verificado el mismo día:** las 17 redirecciones responden 301 al destino
> correcto contra el dominio real; `x-robots-tag` NO se sirve en producción; el
> 404 devuelve 404; HTTPS válido; los 4 MX de Google, el SPF y el DKIM
> intactos; `admin.mipc.com.co` sigue resolviendo a `190.29.110.179`; correo
> entrante y saliente confirmado por el cliente.

Este documento transcribe los pasos que **no** se pueden ejecutar desde este
repositorio: requieren las cuentas propias del cliente (Cloudflare, Google,
Hostinger) y control del DNS de `mipc.com.co`. Ningún agente automatizado los
ejecutó.

---

## Lo que la realidad corrigió del plan

Nada de esto estaba previsto y todo costó tiempo. Se registra aquí porque la
próxima vez no debería volver a costarlo.

### 1. La importación de Cloudflare se dejó nueve registros — el fallo más caro

Al añadir el dominio, Cloudflare escanea la zona e importa lo que encuentra.
**No encontró el bloque entero de `coopebello`** (MX, SPF, tres DKIM,
autoconfig, autodiscover), ni `os`, ni `pruebaapp`. Nueve registros, y entre
ellos el correo completo de un subdominio.

Si los nameservers se hubieran cambiado ahí, ese correo habría muerto en
silencio: una zona que responde pero a la que le falta un MX no da ningún
error, simplemente deja de recibir.

Lo atrapó `npm run check:dns -- <ns-de-cloudflare>`, que compara la zona
servida contra el archivo de referencia **preguntándole directamente a los
nameservers de Cloudflare, con el correo todavía en Hostinger**. Esa es la
propiedad que lo hace útil: los NS asignados responden por la zona en cuanto
se añade el dominio, aunque el registrador siga apuntando a otro sitio, así
que toda la verificación ocurre sin ventana de riesgo.

**El aviso naranja de Cloudflare que dice «our scan may have missed uncommon
records» va en serio. No es una fórmula de cortesía.**

### 2. El archivo de referencia también tenía un hueco

El escaneo de Cloudflare encontró `app` (A y TXT), que **no estaba en el export
del 2026-08-15**. Es decir, las dos fuentes tenían puntos ciegos distintos y
solo la unión de ambas daba la zona real.

Y revela un límite de `check-dns.mjs` que conviene tener presente: detecta lo
que falta respecto de la referencia, pero **no puede ver lo que existe en
producción y no está en ella**. No se puede consultar un nombre que no se sabe
que existe. La única fuente que lo lista todo es el export del panel.

### 3. Cloudflare importó TODO proxificado

Todos los `A` y `CNAME` entraron con la nube naranja. Hubo que pasar a **DNS
only**:

- `hostingermail-a/b/c._domainkey` — proxificados, la consulta TXT deja de
  seguir el CNAME y **la firma DKIM no se puede validar**: el correo saliente
  empieza a caer en spam. Es el más peligroso porque no rompe nada visible.
- `ftp` — FTP no es HTTP; proxificado deja de funcionar del todo.
- `autoconfig`, `autodiscover` — Cloudflare serviría su propio certificado.
- `admin` — **aplicación en producción**. Proxificar una app viva durante una
  migración puede romperla por el certificado del origen, por WebSockets o por
  peticiones largas, y ninguno de esos fallos tiene que ver con el corte pero
  se le echaría la culpa al corte.

`check-dns.mjs` también detecta esto: un registro proxificado resuelve a IPs de
Cloudflare en vez de a su valor real, así que aparece como discrepancia.

### 4. Conectar el dominio al Worker exige borrar el registro antes

Cloudflare **no reemplaza** el registro existente: rechaza el Custom Domain con
«hostname already has externally managed DNS records». Hay que borrar el `A`
del raíz y el `CNAME` de `www` primero, y luego añadir el dominio.

Es inocuo mientras los nameservers no se hayan movido —la zona de Cloudflare
todavía no es autoritativa—, pero deja una ventana en la que la zona no tiene
ni el registro viejo ni el Worker conectado. Si el «Add domain» fallara ahí,
hay que recrear el registro a mano antes de seguir.

### 5. Los Custom Domain no resuelven hasta que la zona está Activa

Con la zona en **Pending**, los nameservers de Cloudflare responden a los MX y
TXT normales pero devuelven NODATA para el raíz y el `www`. Es esperado: las
rutas de Worker se materializan al activarse la zona, y la zona se activa
cuando el registro publica la delegación. **No es un fallo y no hay que
arreglarlo.**

### 6. Las variables de entorno de un Worker de assets van en otro sitio

`Settings → Variables & Secrets` es de **runtime**, y un Worker de solo assets
estáticos ni siquiera las admite — el panel lo dice explícitamente. Este sitio
es estático: Vite sustituye `import.meta.env.PUBLIC_*` **durante el build**.

> **Settings → Build → Build variables and secrets**

Ese error se llevó por delante una protección: la guarda que falla el build sin
`PUBLIC_WEB3FORMS_KEY` comprobaba `process.env.CF_PAGES`, que solo existe en
Pages. En Workers la variable es `WORKERS_CI`, así que la red de seguridad
llevaba todo el proyecto sin tenderse justo en la plataforma real. Corregido en
`src/lib/despliegue.ts`, con test.

### 7. `ccemail` de Web3Forms es de pago y rechazaba TODOS los envíos

No lo ignora en el plan gratuito: devuelve «You are trying to use a Pro
feature» y **descarta la solicitud entera**. El formulario se veía bien,
validaba bien, y el visitante recibía una pantalla de error tras escribir su
mensaje. Del lado de la empresa la única señal era la ausencia de correos.

Campo retirado. La copia a una segunda dirección se resuelve con una regla de
reenvío en la bandeja de `gerencia@` — el MX es de Google.

### 8. DNSSEC estaba desactivado, y menos mal

Comprobado antes del corte: sin registros `DS` ni `DNSKEY`. Si hubiera estado
activo con las claves del proveedor anterior, mover los nameservers sin
desactivarlo primero **habría dejado el dominio sin resolver por completo** —web
y correo—, con un fallo cacheado y lento de revertir. Es el único error de esta
lista que sí mata un dominio. **Comprobarlo siempre antes de mover nada.**

---

## Decisiones de alcance tomadas el 2026-08-16

El cliente acotó el objetivo del corte a **tres cosas**: la aplicación en
`admin.mipc.com.co`, la landing y el correo. Todo lo que no sirviera a una de
las tres se dejó morir.

| Registro | Decisión |
|---|---|
| `admin` | **Conservado.** Aplicación en producción, en DNS only |
| MX, SPF, `krs._domainkey`, `hostingermail-*`, `autoconfig`, `autodiscover` | **Conservados.** Son el correo |
| `coopebello` (8 registros) | Retirado: correo sobre subdominio que ya no se usa |
| `os`, `app`, `ftp`, `pruebaapp` | Retirados: servicios viejos y restos |

Los retirados **siguen listados** en `docs/dns/zona-mipc.com.co-2026-08-16.txt`
con sus valores exactos, y `check-dns.mjs` avisa de su ausencia sin fallar. Se
documentan en vez de borrarse para que la decisión sea reversible, y se avisa
en cada ejecución para que siga siendo una decisión visible y no un olvido.

Nota sobre `ftp`: borrarlo **no quita el acceso FTP** al hosting. Hostinger da
su propio host y credenciales en el panel; ese registro era un alias cómodo. El
plan de conservar el WordPress recuperable 60 días sigue intacto.

---

## Lo que queda pendiente

- [ ] **Search Console.** Crear la propiedad de tipo **Dominio** (verificación
      por TXT, que ahora es trivial porque el DNS es propio) y enviar
      `sitemap-index.xml`. **Mirar primero si ya existe una propiedad** bajo
      `gerencia@mipc.com.co`: si la hay, se hereda el histórico del WordPress.
- [ ] **Línea base perdida.** El plan pedía verificar Search Console *antes*
      del corte para poder comparar impresiones después. No se hizo, y la
      herramienta no rellena hacia atrás. Si no aparece una propiedad
      preexistente, la comparación «antes/después» de la migración no se puede
      hacer: si a 60 días algo va mal, no habrá contra qué medirlo.
- [ ] **Medición.** `PUBLIC_GA4_ID`, `PUBLIC_GOOGLE_ADS_ID` y
      `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` en Build variables, y marcar
      `clic_whatsapp` y `clic_telefono` como eventos clave en GA4 para
      importarlos a Ads.
- [ ] **`www` → 301.** Hoy `www.mipc.com.co` responde 200 con el mismo
      contenido. El `canonical` ya apunta al raíz, así que Google consolida,
      pero un 301 ahorra rastreo. Se hace con una Redirect Rule de Cloudflare,
      disponible en el plan Free.
- [ ] **`mipctecnologia.com`.** Sigue en la cuenta del tío, **vence el
      2026-09-19** y hoy devuelve error 500. Hay que traspasarlo, confirmar la
      autorrenovación y redirigirlo con un 301 a `https://mipc.com.co/`.
- [ ] **No borrar el WordPress** hasta pasados 60 días del corte.

---

# Runbook

De aquí abajo está el procedimiento tal como se escribió antes del corte, con
el estado real de cada paso anotado en su cabecera. Se conserva porque casi
todo sigue siendo válido y porque hay que repetirlo el día que se mueva otro
dominio — empezando por `mipctecnologia.com`.

## Antes de cualquier otra cosa: el comando de build

**El proyecto de Cloudflare Pages debe configurarse con el comando de build
`npm run build`, nunca `astro build` directamente.**

La razón no es una preferencia de estilo. `npm run build` son dos cosas:

```
"build": "astro build && node scripts/check-html.mjs"
```

`scripts/check-html.mjs` es el control de calidad que recorre las 32 páginas
construidas y falla el build si alguna pierde su `h1`, su meta descripción, su
canónica, su `lang`, o si un `alt` es un nombre de archivo. Son exactamente los
defectos que tenía el sitio de WordPress. Si Cloudflare invoca `astro build` a
secas, el sitio se publica igual pero **sin que nadie compruebe nada**: el
control existe y no corre.

Las redirecciones sí están a salvo de esto. Se generan desde el hook
`astro:build:done` de `astro.config.mjs`, que vive dentro del propio
`astro build` y por tanto ningún comando de npm puede saltárselo. Es un cambio
deliberado respecto del diseño original, que las generaba desde un hook
`prebuild` de npm — precisamente el que un `astro build` directo sí se salta,
publicando el sitio con cero redirecciones y mandando a un 404 a todo el que
llegue por un enlace o resultado viejo. El mecanismo viejo ya no existe; esta
nota queda porque explica por qué el actual está donde está.

Configuración correcta —confirmada en el proyecto real de Workers el 2026-08-16:
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Variables:** `PUBLIC_WEB3FORMS_KEY` y las de medición van en
  **Settings → Build → Build variables and secrets**, NO en
  `Settings → Variables & Secrets`. La segunda es de runtime y un Worker de
  solo assets estáticos ni siquiera la admite: el panel responde «Variables
  cannot be added to a Worker that only has static assets». Este sitio es
  estático, así que las necesita en el build, que es cuando Vite sustituye
  `import.meta.env.PUBLIC_*` y las hornea en el HTML.

## Paso 1: Crear el proyecto en Cloudflare
> ✅ **Hecho.** Acabó siendo **Workers** con assets estáticos (`mipc-landing-o2`),
> no Pages — la duda que plantea el aviso de abajo quedó resuelta por la
> realidad. `wrangler.jsonc` con `not_found_handling: "404-page"` fue necesario
> y funciona: las URLs inexistentes devuelven 404 con la página propia.

> ### ⚠️ Puede que no exista la opción «Pages»
>
> Todo este documento se escribió para **Cloudflare Pages**. Un despliegue
> paralelo de este mismo sitio, hecho el 2026-08-14, se encontró con que el
> asistente de Cloudflare **crea proyectos de Workers por defecto** y que Pages
> quedó en modo mantenimiento para proyectos nuevos. No he podido comprobarlo
> yo —haría falta la cuenta del cliente—, así que quien despliegue debe mirar
> qué le ofrece la consola y seguir la rama que corresponda.
>
> **Da igual cuál sea**: el sitio es HTML estático y funciona en las dos. Lo
> que cambia son tres detalles, ya verificados en ese despliegue paralelo:
>
> | | Pages | Workers con assets estáticos |
> |---|---|---|
> | `_headers` y `_redirects` | Funcionan | Funcionan igual (9/9 redirecciones y 7/7 cabeceras comprobadas) |
> | Página 404 propia | Automática | Requiere `wrangler.jsonc` con `not_found_handling: "404-page"` |
> | `noindex` mientras no hay dominio | Lo pone `public/_headers` (Paso 2) | Lo pone `public/_headers` **igual**: Cloudflare NO lo inyecta solo (medido el 2026-08-15, ver Paso 2) |
>
> Una diferencia sí puede morder: **`_redirects` en Workers no admite el
> código 404**. Nuestro mapa no usa ninguna regla así —las 17 son 301 a
> páginas que existen—, de modo que no nos afecta, pero conviene saberlo antes
> de añadir una.

- [ ] Crear el proyecto conectado al repositorio (Pages si la consola lo
      ofrece; Workers con assets estáticos si no).
- [ ] Build command `npm run build` (ver advertencia arriba, no `astro build`).
- [ ] Build output directory `dist`.
- [ ] Si el proyecto acabó siendo de Workers: añadir `wrangler.jsonc` con
      `not_found_handling: "404-page"`, o `dist/404.html` no se servirá y las
      URLs inexistentes darán la página de error genérica de Cloudflare en vez
      de la nuestra.
- [ ] Añadir la variable de entorno `PUBLIC_WEB3FORMS_KEY` con la clave real de Web3Forms.
- [ ] Analítica, **solo cuando se quiera activar**: `PUBLIC_GA4_ID` (formato
      `G-XXXXXXX`) y `PUBLIC_GOOGLE_ADS_ID` (formato `AW-XXXXXXX`).
- [ ] `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`: la etiqueta de la acción de
      conversión «formulario enviado», es decir **solo el trozo posterior a la
      barra** del identificador que Ads muestra como
      `AW-123456789/AbC-D_efGhIj`. Se crea en Google Ads → Objetivos →
      Conversiones → acción de conversión del sitio web → «Instalar la
      etiqueta manualmente».

  Sin ella —aun con `PUBLIC_GOOGLE_ADS_ID` puesto— la conversión de
  `/gracias/` no se emite. Es deliberado: una conversión con el identificador
  a medias no se registra en ningún sitio y tampoco da error, así que es
  preferible el hueco visible en Ads a la pérdida silenciosa.

  Mientras `PUBLIC_GA4_ID` y `PUBLIC_GOOGLE_ADS_ID` no existan, el sitio **no
  emite una sola línea de Google**: ni el script, ni el `dataLayer`, ni el
  banner de cookies, ni los eventos de conversión. Lo comprueba
  `tests/analitica.test.ts` sobre las 32 páginas construidas, así que se puede
  desplegar y cortar el dominio sin decidir nada de analítica y sin arrastrar
  etiquetas vacías.

  El día que se pongan, se activa Consent Mode v2 con **todo denegado de
  entrada** y aparece el banner. Nada se mide hasta que el visitante acepta.

- [ ] **En GA4, marcar `clic_whatsapp` y `clic_telefono` como eventos clave**,
      y luego importarlos en Google Ads como conversiones (Ads → Objetivos →
      Conversiones → Importar → Google Analytics 4).

  Este paso no está en el código y no hay forma de que lo esté: esos dos
  eventos se envían a GA4, no a Ads, porque un clic en WhatsApp no es una
  conversión inequívoca —se abre la aplicación y puede no escribirse nada— y
  conviene poder decidir en la interfaz si cuenta o no sin volver a desplegar.
  Si nadie hace esta importación, Ads seguirá viendo solo los formularios, que
  probablemente son la minoría de los contactos.

- [ ] Comprobar las conversiones con la **vista previa de etiquetas de Google**
      (Ads → Herramientas → Diagnóstico de etiquetas, o la extensión Tag
      Assistant), no leyendo el HTML. Que el evento esté en la página no
      demuestra que Ads lo reciba.

## Paso 2: Impedir la indexación mientras el sitio vive en pages.dev
> ✅ **Hecho y validado por el corte.** La regla acotada por host funcionó
> exactamente como se esperaba: `workers.dev` sirve `X-Robots-Tag: noindex` y
> `mipc.com.co` **no lo sirve**. Comprobado con `curl` el 2026-08-16, ya en
> producción. Por eso las reglas se quedan puestas — ver más abajo.

> **Si el proyecto acabó siendo de Workers** (ver Paso 1), sustituir
> `pages.dev` por `workers.dev` en todo lo que sigue, aquí y en el Paso 3.
> **Este paso NO se salta.**
>
> Una versión anterior de esta nota decía que Cloudflare inyecta
> `X-Robots-Tag: noindex` en todo `*.workers.dev` por su cuenta y que la regla
> de `public/_headers` no hacía falta. **Es falso**, y lo desmiente la
> medición del 2026-08-15 registrada unas líneas más abajo en este mismo
> documento: el despliegue real en
> `mipc-landing-o2.santiago-martinez.workers.dev` **no traía la cabecera**
> hasta que se corrigió el host en `public/_headers`. Comprobado de nuevo el
> 2026-08-16, ya con el host correcto, la cabecera sí se sirve — es decir,
> viene de `_headers`, no de Cloudflare.
>
> Las dos afirmaciones no podían ser ciertas a la vez y la equivocada era la
> que no tenía ninguna medición detrás. Se corrige aquí porque creerla lleva a
> saltarse el paso y a dejar el sitio de pruebas indexable, que es exactamente
> lo que ya pasó una vez.

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

- [ ] Verificar que el subdominio en `public/_headers` coincide con el proyecto real.
- [ ] Confirmar con una petición real que la cabecera `X-Robots-Tag: noindex` se sirve.

> ### ⚠️ Esto ya falló una vez — comprobarlo de verdad, no darlo por hecho
>
> El 2026-08-15 se midió el despliegue real en
> `mipc-landing-o2.santiago-martinez.workers.dev` y **no traía la cabecera**.
> La regla de `public/_headers` apuntaba a `https://PROYECTO.pages.dev/*`, un
> marcador de posición que no coincide con ninguna URL existente, así que no
> aplicaba a nada. Encima, `robots.txt` sirve `Allow: /`. Resultado: el sitio
> de pruebas quedó completamente indexable.
>
> No falla de forma visible. Una regla de `_headers` que no coincide con
> ningún host simplemente no hace nada — no da error, no avisa. La única
> manera de saberlo es pedir la cabecera:
>
> ```bash
> curl -I https://<host>/ | grep -i x-robots
> ```
>
> Si eso no devuelve nada, la regla no está aplicando. Ya está corregida en
> `public/_headers` con el host real, pero **requiere volver a desplegar** y
> comprobarlo otra vez con el comando de arriba.

## Paso 3: Revisar en pages.dev antes de cortar
> ⚠️ **Hecho a medias.** Se verificaron contra `workers.dev` las 17
> redirecciones, el formulario (llegada real del correo) y el HTML construido.
> **No** se hizo la revisión en un móvil real ni la comprobación de barra final
> con `curl`. Salió bien igualmente, pero es suerte, no método: la revisión
> móvil sigue siendo la forma de atrapar un desbordamiento horizontal antes de
> que lo vea un cliente.

En un móvil real, contra la URL de `pages.dev`:

- [ ] No hay desbordamiento horizontal en ninguna página (regresión CRIT-02).
- [ ] El formulario de contacto envía y llega a la bandeja de Web3Forms (o al
      correo configurado). **No** se puede verificar que redirige a
      `/gracias/` en `pages.dev`: el campo `redirect` del formulario es
      absoluto a `https://mipc.com.co/gracias/`, y hasta el corte ese dominio
      sigue sirviendo el WordPress viejo. Confirmar el envío por la llegada
      real del mensaje, no por la pantalla de destino.
- [ ] El botón de WhatsApp abre con el mensaje precargado.
- [ ] Los enlaces de las tarjetas de servicio llevan a su página correspondiente (regresión CRIT-01).
- [ ] Correr el verificador de redirecciones contra el propio `pages.dev`,
      **antes** de mover el DNS:

  ```bash
  node --experimental-strip-types scripts/check-redirecciones.mjs https://<proyecto>.pages.dev
  ```

  El script acepta cualquier URL base por parámetro, así que esto sí se
  puede correr antes del corte (a diferencia de la verificación del Paso 6,
  que necesita el dominio real ya apuntando al sitio nuevo). **Esta es la
  única comprobación de esta lista capaz de atrapar un comando de build mal
  configurado en Cloudflare antes de que el DNS se mueva**: si Cloudflare
  quedó corriendo `astro build` en vez de `npm run build` — o si redetectó el
  preset y descartó el comando personalizado —, `dist/_redirects` de todas
  formas se genera ahora vía el hook `astro:build:done` de
  `astro.config.mjs`, pero correr esto contra `pages.dev` es lo que confirma
  que las 17 reglas realmente están sirviendo, en vez de asumirlo.
- [ ] Con `curl -I`, comparar la misma URL con y sin barra final contra
      `pages.dev`, para confirmar qué forma responde 200:

  ```bash
  curl -I https://<proyecto>.pages.dev/servicios
  curl -I https://<proyecto>.pages.dev/servicios/
  ```

  El proyecto está configurado con `trailingSlash: 'always'` y todas las
  fuentes del mapa de redirecciones terminan en `/`, salvo `/wp-sitemap.xml`
  y el comodín `/wp-content/uploads/*`, que por su naturaleza no pueden. Si la
  plataforma normaliza al revés (sin barra final), tanto las URLs canónicas del
  sitio nuevo como las redirecciones heredadas de WordPress fallan
  silenciosamente.

  **Lo que sí es normal y no hay que arreglar:** que `/servicios` responda
  **307** hacia `/servicios/` en lugar de 301. Es el comportamiento por
  defecto de Cloudflare Assets, Google sigue los 307 sin problema, y forzar
  301 exigiría una regla por página en `_redirects` que habría que mantener
  sincronizada con las rutas para siempre. Se deja como está a propósito.

## Paso 4: Lista de verificación previa al corte
> ⚠️ **Hecho salvo dos puntos, y uno de ellos tiene consecuencias.**
> Sí se hizo: horario confirmado, `npm run verify` en verde, zona DNS
> inventariada y verificada, DNSSEC comprobado, autorrenovación confirmada.
> **NO se hizo:** verificar Search Console antes del corte —así que no hay
> línea base de impresiones contra la que comparar— ni bajar el TTL a 300 s con
> antelación. Lo segundo no dolió: el TTL de 4 h del registro `A` viejo solo
> produjo que durante unas horas parte de los visitantes siguiera viendo el
> WordPress, que responde igual de bien. Lo primero no se puede recuperar.

- [x] Horario de atención confirmado con el cliente el 2026-08-15: **Lun a Vie 08:00–17:00, Sáb 09:00–13:00**. Ya está en `src/data/empresa.ts`, de donde salen el pie, `/contacto/` y el `openingHoursSpecification` del schema.
- [ ] **Ficha de Google Business Profile: no crear, corregir.** La ficha ya existe y la administra el cliente (CID `15154712519055002689`). Entrar y comprobar, campo por campo, que coincide con `src/data/empresa.ts` — cualquier diferencia entre la ficha y el schema del sitio es una señal contradictoria para el posicionamiento local, y la ficha pesa más que el sitio en el paquete local de resultados:

  | Campo en la ficha | Valor que publica el sitio |
  |---|---|
  | Nombre | MiPC Tecnología |
  | Dirección | Carrera 66A # 34-48, Interior 101 — Laureles, Medellín |
  | Teléfono | 314 888 90 78 |
  | Horario | Lun a Vie 08:00–17:00 · Sáb 09:00–13:00 |
  | Sitio web | `https://mipc.com.co` (apuntar a la raíz, no a una URL de WordPress) |
  | Categoría principal | Servicio de reparación de computadoras / Soporte técnico informático |

  Ojo con el sitio web de la ficha: si apunta a una URL antigua de WordPress que después del corte responde 404, la ficha manda tráfico a una página muerta.
- [ ] Search Console verificado por registro DNS TXT en `mipc.com.co`, con línea base de impresiones/clics acumulada antes del corte (para poder comparar después).
- [ ] GA4 instalado y registrando la visita a `/gracias/` como conversión.
- [ ] `npm run verify` en verde (ver estado en el informe de la Tarea 17).
- [ ] Inventario de las URLs actuales del sitio en WordPress guardado (capturas o export del sitemap), por si hace falta comparar después del corte.
- [ ] TTL del DNS de `mipc.com.co` bajado a 300 s, 24-48 horas antes del corte.

## Paso 5: Ejecutar el corte
> ✅ **Hecho el 2026-08-16.** El aviso de abajo sobre el correo resultó ser el
> punto exacto donde estuvo el peligro, aunque no por donde se esperaba: no
> falló el traslado de la zona, falló **la importación automática de
> Cloudflare**, que se dejó nueve registros. Ver «Lo que la realidad corrigió
> del plan», punto 1.
>
> El correo se confirmó funcionando en los dos sentidos antes de dar el corte
> por bueno. El `noindex` **no se retiró**, y es lo correcto: está acotado por
> host y quitarlo habría hecho indexable el subdominio de Workers.

> ### ⚠️ El dominio no solo sirve el sitio: también sirve el correo
>
> `mipc.com.co` lleva mucho más que un registro `A`. La zona actual está
> guardada en `docs/dns/zona-mipc.com.co-2026-08-15.txt` y contiene, además
> del sitio:
>
> | Registro | Qué se rompe si se pierde |
> |---|---|
> | `MX` → `aspmx.l.google.com` y las tres alternativas | El correo de la empresa, incluido `gerencia@mipc.com.co`, que es donde llegan las cotizaciones del formulario |
> | `TXT` SPF con Hostinger, Google y Mailgun | Los correos salientes empiezan a caer en spam |
> | `krs._domainkey` (clave RSA) y `hostingermail-a/b/c._domainkey` | Firma DKIM inválida → spam |
> | `coopebello` con su propio `MX` a Hostinger | Un servicio de correo independiente sobre subdominio |
> | `admin` → `190.29.110.179` | Un panel alojado en otra IP |
> | `ftp`, `os`, `www` | Acceso y subdominios en uso |
>
> **Mover los nameservers a Cloudflare sin trasladar todo esto tumba el
> correo de la empresa el mismo día del corte.** Cloudflare importa los
> registros automáticamente al añadir el dominio, pero **la importación no
> es verificación**: importa lo que consigue leer, y lo que no lea se
> pierde en silencio.
>
> El orden correcto es: añadir el dominio en Cloudflare, **comparar la zona
> importada contra el archivo de referencia registro por registro**, y solo
> entonces cambiar los nameservers en el registrador. Mientras los
> nameservers sigan en Hostinger, nada de esto se ve afectado y hay tiempo
> ilimitado para revisar.

- [ ] Añadir `mipc.com.co` en Cloudflare y dejar que importe la zona, **sin
      cambiar todavía los nameservers en el registrador**.
- [ ] Comparar la zona importada contra `docs/dns/zona-mipc.com.co-2026-08-15.txt`.
      **No a ojo:** hay 21 conjuntos de registros y el que falte no avisa.

  ```bash
  npm run check:dns -- <ns-asignado>.ns.cloudflare.com
  ```

  El script acepta un servidor de nombres y le pregunta **directamente**. Esa
  es la parte que importa: los nameservers que Cloudflare asigna ya responden
  autoritativamente por la zona en cuanto se añade el dominio, aunque el
  registrador siga apuntando a Hostinger. Es decir, **se puede verificar la
  zona importada antes de mover nada y sin ventana de riesgo**. Si falta algo,
  se corrige en Cloudflare con el correo todavía funcionando en Hostinger.

  Sale con 0 solo si están los cuatro `MX` de Google, el `TXT` de SPF, el
  `TXT` de `krs._domainkey`, los seis CNAME `hostingermail-*._domainkey`
  (dominio y `coopebello`), los de `autoconfig`/`autodiscover`, el bloque de
  `coopebello` y los registros de `admin`, `ftp` y `os`. Los del sitio —`@` y
  `www`— los informa aparte, porque esos sí tienen que cambiar.

  Ojo: **no basta con que salga en verde una vez**. Correrlo otra vez después
  de cambiar los nameservers es lo que confirma que lo que sirve Cloudflare
  al mundo es lo mismo que se verificó.
- [ ] Añadir en Cloudflare el registro que apunta el sitio al proyecto (Pages o Workers)
      (`www` y el ápice), sin tocar ninguno de los anteriores.
- [ ] **Solo cuando lo anterior esté verificado:** cambiar los nameservers en
      el registrador a los de Cloudflare.
- [ ] Enviar un correo de prueba a `gerencia@mipc.com.co` **desde fuera de la
      organización** y confirmar que llega, y otro desde esa cuenta hacia una
      dirección externa confirmando que no cae en spam. El correo es lo
      primero que hay que comprobar después del cambio, antes que el sitio:
      un sitio caído se nota en minutos, un correo perdido no se nota nunca.
- [ ] **Comprobar** el `noindex` en el dominio real. NO retirarlo de entrada:

  ```bash
  curl -I https://mipc.com.co/ | grep -i x-robots   # debe devolver NADA
  ```

  Las dos reglas de `public/_headers` están acotadas por host a
  `mipc-landing-o2.santiago-martinez.workers.dev` y a `mipc-landing-o2.pages.dev`.
  Ninguna coincide con `https://mipc.com.co/*`, así que **no deberían aplicar a
  producción**, y dejarlas puestas tiene una ventaja concreta: el subdominio de
  Workers sigue fuera del índice para siempre, en vez de convertirse en una
  copia del sitio de producción compitiendo como contenido duplicado justo
  después del corte.

  Retirarlas «por si acaso» es lo que crea ese duplicado. Retíralas **solo si
  el `curl` de arriba devuelve la cabecera** en el dominio real — en cuyo caso
  el acotado por host no está funcionando como se espera y hay que quitar las
  reglas y volver a desplegar de inmediato.

  Esta comprobación es **bloqueante**: un dominio de producción con
  `X-Robots-Tag: noindex` no aparece en buscadores por perfecto que esté el
  resto del SEO, y no da ningún error que lo delate.
- [ ] Configurar en `mipctecnologia.com` (dominio que hoy responde HTTP 500)
      un 301 hacia `https://mipc.com.co/`. El spec lo exige y ninguna tarea
      del proyecto lo posee porque vive fuera de este repositorio: es
      configuración del registrador o de Cloudflare para ese segundo
      dominio, no del sitio Astro. Sin este paso, cualquier enlace o
      posicionamiento heredado de `mipctecnologia.com` sigue muriendo en un
      error 500 después del corte.
- [ ] **No borrar el WordPress.** Apagarlo pero mantenerlo recuperable durante 60 días, por si algo del corte falla y hay que volver atrás.

## Paso 6: Verificar las redirecciones en producción
> ✅ **Hecho.** `Las 17 redirecciones responden correctamente` contra
> `https://mipc.com.co`, incluida la regla comodín de `/wp-content/uploads/*`,
> que se comprueba con la URL de ejemplo declarada en el mapa.
> Falta el 301 de `mipctecnologia.com`, que sigue pendiente.

Correr, ya con el dominio en vivo apuntando al sitio nuevo:

```bash
node --experimental-strip-types scripts/check-redirecciones.mjs https://mipc.com.co
```

Se espera: las 17 redirecciones definidas en `src/data/redirecciones.ts`
responden 301 al destino correcto. La regla comodín de `/wp-content/uploads/*`
se comprueba con la URL de ejemplo que lleva declarada, no con el asterisco
literal. Esta invocación concreta, contra
`https://mipc.com.co`, **no se puede ejecutar antes del corte** — hasta el
corte ese dominio sigue sirviendo el WordPress viejo, así que correrla antes
no prueba nada sobre el sitio nuevo. El mismo script sí se corrió antes del
corte, contra `pages.dev`, en el Paso 3: esa es la comprobación temprana:
esta de aquí es la confirmación final contra producción.

- [ ] Ejecutar el comando anterior contra el dominio real, después del corte.
- [ ] Si alguna redirección falla, no continuar con el paso 7 hasta corregirla.
- [ ] Confirmar con `curl -I https://mipctecnologia.com/` que responde 301 a
      `https://mipc.com.co/` (Paso 5) y ya no el error 500 anterior.

## Paso 7: Enviar el sitemap y arrancar la vigilancia
> ⏳ **Pendiente entero.** Es lo único del corte que queda sin hacer, junto con
> activar la medición. Ver «Lo que queda pendiente» arriba, y ojo con el punto
> de la línea base: sin propiedad previa en Search Console, el umbral de alarma
> del 20 % que se define abajo **no se puede evaluar**, porque no hay
> histórico contra el que compararlo.

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

El detalle completo (dimensiones de cada fotografía, qué contenía el recorte
de la foto 17, dónde quedó cada imagen, resultado de `npm run verify` y peso
del build antes/después) vivía en `.superpowers/sdd/2026-08-14-mipc-astro/task-17-report.md`.
Ese directorio está en `.gitignore` y no persiste después de clonar el
repositorio, así que ese registro no está disponible aquí; lo relevante para
el corte es exactamente lo que este documento ya enumera arriba.
