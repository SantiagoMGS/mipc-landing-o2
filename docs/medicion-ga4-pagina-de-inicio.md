# Cómo mide GA4 el tráfico, y qué pasa con la página de inicio de los equipos

Escrito el **2026-08-21**, a petición de Santiago, que planteó cuatro dudas
sobre la medición: si GA4 distingue una apertura automática de navegador, si
agrupa visitas por IP, cómo separar el tráfico real del ruido, y si eso afecta
al posicionamiento. El contexto que las motiva: **desde hace años, a todos los
equipos que MiPC formatea o vende se les deja `mipctecnologia.com` como página
de inicio de Chrome.**

Lo del apartado 1 está **medido** y se puede repetir con los comandos que lleva
al lado. Los apartados 2 a 5 son funcionamiento documentado de GA4 y de la
búsqueda de Google, no mediciones de este sitio. Donde hay recomendación, se
marca como tal.

---

> ## ⚠️ LO PRIMERO, PORQUE CAMBIA TODO LO DEMÁS
>
> **`mipctecnologia.com` no lleva a la web. Lleva a una página de error.**
>
> Ninguna de esas aperturas de Chrome está llegando al sitio ni apareciendo en
> GA4. La base instalada no está inflando las métricas: está viendo un error
> con la marca de MiPC encima, cada mañana.
>
> Y **el dominio vence el 2026-09-19**, dentro de cuatro semanas, en una cuenta
> que no es de MiPC.

---

## 1. Medido: la cadena de redirecciones de `mipctecnologia.com`

```bash
curl -sS -I -m 12 "http://mipctecnologia.com/"
curl -sS -I -m 12 -L "https://mipctecnologia.com/"
curl -sS -I -m 12 -L "https://app.mipc.com.co/"
nslookup app.mipc.com.co
```

Resultado del 2026-08-21:

```
http://mipctecnologia.com   → 301 → https://mipctecnologia.com   (Server: hcdn)
https://mipctecnologia.com  → 302 → https://app.mipc.com.co      (Server: hcdn)
https://app.mipc.com.co     → curl: (6) Could not resolve host
                            → nslookup: Non-existent domain (NXDOMAIN)

mipctecnologia.com  A  147.79.120.185, 148.135.128.221   (Hostinger)
mipc.com.co         200 OK                               (Server: cloudflare)
```

Lo que ve el cliente al abrir Chrome es la pantalla de Chrome *«No se puede
acceder a este sitio web — No se ha encontrado la dirección DNS del servidor de
app.mipc.com.co»*, `DNS_PROBE_FINISHED_NXDOMAIN`.

**Esto corrige una suposición de `docs/verificacion-produccion.md` §5.7**, que
registró el `302` como informativo con este razonamiento: *«puede ser
deliberado — es plausible que se use como atajo para entrar a la aplicación»*.
No hay aplicación al otro lado; el destino no existe. Y con el dato nuevo de
que ese dominio es la página de inicio de la base instalada, deja de ser un
dato informativo: es la tarea más urgente que queda del corte de dominio.

Ya estaba anotado como pendiente en dos sitios, sin dueño porque vive fuera de
este repositorio: `docs/despliegue-corte-dominio.md:278` (traspaso,
autorrenovación y `301`) y `docs/despliegue-corte-dominio.md:682` (el `301`
como requisito del spec). Lo que este documento añade es **por qué es urgente**
y **cuánto vale**, que antes no se sabía.

### Tres consecuencias

1. **Cero de ese tráfico está en GA4.** No hay etiqueta que dispararse si no se
   carga ninguna página del sitio. Los **113 usuarios / 920 eventos / 18
   eventos clave** del 14 al 20 de agosto **no son la base instalada**: son
   tráfico de otra procedencia, probablemente más real de lo que se pensaba.
2. **La recordación de marca se está tirando, y en negativo.** El truco de la
   página de inicio es bueno; hoy produce lo contrario de lo que busca.
3. **Riesgo con fecha.** Si el dominio caduca el 2026-09-19, la página de
   inicio de cientos de equipos de clientes pasa a ser lo que ponga quien lo
   compre. Eso ya no es una oportunidad perdida, es una exposición de marca.

### Nota sobre la base instalada

`docs/prioridad-reparacion-o-base-instalada.md` lleva una corrección grande: los
«+70 empresas» son las atendidas desde 2009 y **no** una lista de relaciones
vivas, así que no existía el canal barato que ese documento proponía.

Esta página de inicio **sí es un canal vivo**, y de otra naturaleza: no depende
de que nadie conserve el contacto, funciona sola cada vez que alguien abre el
navegador. No cambia la recomendación de ese documento —no es un canal para
*llamar* a nadie—, pero es un activo real que allí no se tuvo en cuenta.

**Falta un número para dimensionarlo, y solo lo tiene Santiago: ¿en cuántos
equipos, aproximadamente, se ha dejado configurada esa página de inicio?** De
eso depende si arreglar el `301` vale unas pocas visitas al día o unos cientos.

---

## 2. ¿GA4 detecta que la visita viene de la página de inicio del navegador?

**No. Le es completamente invisible.**

GA4 solo ve que se cargó una página. No tiene forma de saber si el usuario
escribió la URL, pulsó un marcador, o si Chrome la abrió sola al arrancar. Lo
cuenta como una vista de página normal, con su `session_start`, y la atribuye a
**Directo** (`direct / none`), porque una apertura de navegador no lleva
referente.

Único matiz técnico: si Chrome **precarga** la página de inicio sin que llegue a
mostrarse, `gtag.js` retrasa la medición hasta que la pestaña se activa de
verdad, así que una precarga no vista no cuenta. Pero una apertura real de
Chrome es una carga real y sí se cuenta.

---

## 3. ¿Google agrupa o descarta visitas por IP?

**GA4 no usa la IP para identificar ni para deduplicar usuarios.** La usa un
instante para deducir la ciudad y la descarta: no la almacena, no aparece en
ningún informe y no se puede segmentar por ella.

Quien identifica es la **cookie propia `_ga`** —el `client_id`—, que vive por
navegador y por dispositivo. De ahí:

| Situación | Cómo lo cuenta GA4 |
|---|---|
| 10 clientes distintos en la misma empresa, misma IP pública | **10 usuarios** (10 cookies) |
| El mismo cliente abre 10 veces en un rato corto | **1 usuario, 1 sesión** |
| El mismo cliente abre 10 veces repartidas por el día | **1 usuario, hasta 10 sesiones** |
| El mismo cliente en su portátil y en su torre | **2 usuarios** |

La regla de sesión es de **inactividad: 30 minutos** por defecto, ajustable
entre 5 min y 7 h 55 en *Administrar → Configuración de la propiedad*. Abrir a
las 8:00 y otra vez a las 8:20 es una sola sesión; a las 9:30, son dos.

Dos diferencias respecto al Analytics viejo, que es de donde vienen casi todas
las confusiones con esto:

- **Las sesiones de GA4 no se reinician a medianoche.** Pueden cruzarla.
- **Tampoco se reinician al cambiar la fuente de tráfico** ni la campaña.

El único uso posible de la IP es el **filtro de tráfico interno**, en
*Administrar → Recopilación y modificación de datos → Filtros de datos*. Sirve
para excluir la oficina de MiPC —conviene tenerlo puesto—. No sirve para los
clientes: son cientos de IPs y casi todas dinámicas.

---

## 4. Separar el tráfico real del ruido de la base instalada

En cuanto se arregle el `301`, **sí va a inflar el tráfico**: cientos de equipos
abriendo la portada cada mañana. Dos formas de manejarlo.

### Recomendado: etiquetar la URL de la página de inicio

En los equipos que se formateen a partir de ahora, configurar como inicio:

```
https://mipc.com.co/?utm_source=equipo-cliente&utm_medium=inicio-navegador&utm_campaign=base-instalada
```

Ese tráfico llega a GA4 con fuente y medio propios, separado de un clic real.
Un filtro y desaparece de los informes; o al contrario, se aísla y **se obtiene
gratis una medida de cuántos equipos siguen vivos ahí fuera**, que es
justamente el número que hoy falta.

Tres avisos:

- **No publicar ese enlace** en ningún sitio indexable. El `canonical` del sitio
  apunta al raíz, así que no hay riesgo de contenido duplicado, pero no hace
  falta darle motivos a Google.
- **El UTM no infla sesiones**: GA4 no abre sesión nueva al cambiar de campaña.
- La URL con parámetros **se ve en la barra de direcciones**. Si eso molesta,
  algo más discreto como `?origen=base` hace el mismo trabajo con una dimensión
  personalizada.

### Con lo que ya hay instalado: mirar interacción, no visitas

GA4 ya no habla de «rebote», habla de **sesiones con interacción**, y su
definición es exactamente el filtro que hace falta. Una sesión cuenta como *con
interacción* si cumple **una** de estas tres:

- dura **más de 10 segundos**, o
- tiene **2 o más vistas de página**, o
- dispara **al menos un evento clave**.

Quien abre Chrome y cierra la pestaña no cumple ninguna.

Métricas a mirar, en este orden, en lugar de «usuarios»:

1. **Eventos clave** — `clic_whatsapp`, `clic_telefono` y el formulario de
   `/gracias/` (`src/components/EventosMedicion.astro` y
   `ConversionFormulario.astro`). **Son inmunes al ruido**: nadie pulsa WhatsApp
   por abrir el navegador por error.
2. **Sesiones con interacción** y **% de interacción**.
3. **Tiempo de interacción medio**.

Para el histórico no hay forma de etiquetar hacia atrás, pero sí de segmentar:
en una exploración, sesiones con página de destino `/`, medio `direct` y sin
interacción son, con mucha probabilidad, aperturas de navegador.

---

## 5. ¿Perjudica al posicionamiento orgánico?

**No. Ni perjudica ni ayuda.** Con detalle, porque aquí hay mucha creencia
suelta:

- **Google no usa los datos de Analytics para posicionar.** Lo ha dicho de forma
  explícita y repetida. El GA4 puede estar lleno de ruido sin que mueva una
  posición.
- **El «rebote» no es un factor de ranking.** Nunca lo fue, y en GA4 ni siquiera
  es una métrica de primera clase.
- Es cierto que Google usa **señales de clic** para ordenar resultados —quedó
  documentado en el juicio antimonopolio de 2023-24, con los sistemas del tipo
  NavBoost—. Pero esas señales necesitan **una búsqueda y un clic en un
  resultado**. Quien abre el navegador y ya está en la web no hizo búsqueda ni
  pulsó ningún resultado: no entra en ese circuito por ninguna de las dos
  puntas.

**Donde sí ayuda, y es indirecto:** recordación de marca → gente que dentro de
un mes busca «mipc tecnología medellín». Las **búsquedas de marca** sí son una
señal real de solidez de la entidad, se ven en Search Console, y para separar a
MiPC de las cinco entidades de nombre casi idéntico —el problema que documenta
el NIT en `src/data/empresa.ts`— son de lo más útil que hay. Pero solo funciona
si la página carga.

**Donde sí haría daño es en Google Ads**, cuando se active: ese tráfico ensucia
el denominador de la tasa de conversión, contamina las audiencias de
remarketing y le da ejemplos falsos a la puja inteligente. Razón de más para
etiquetar la URL desde el principio.

---

## Lo que hay que hacer, en orden

- [ ] **Traspasar `mipctecnologia.com`** a una cuenta de MiPC antes del
      **2026-09-19** y confirmar la autorrenovación. Es lo único con fecha
      límite. Ya estaba en `docs/despliegue-corte-dominio.md:278`.
- [ ] **Cambiar el `302` por un `301`** a `https://mipc.com.co/`, en el panel de
      Hostinger donde está hoy la redirección. `301` y no `302`: el temporal no
      transfiere autoridad, así que los enlaces históricos de ese dominio
      tampoco están sumando.
- [ ] **Comprobarlo** con `curl -I https://mipctecnologia.com/`: debe responder
      `301` a `https://mipc.com.co/` y ya no `302` a un dominio inexistente.
- [ ] **Filtro de tráfico interno** en GA4 con la IP de la oficina.
- [ ] **Etiquetar con UTM** la página de inicio en los formateos de aquí en
      adelante.
- [ ] **Decidir qué se hace con los equipos ya entregados**: la página de inicio
      antigua seguirá apuntando a `mipctecnologia.com`, que con el `301` ya
      funciona pero llegará sin etiquetar. No es un problema, solo hay que
      saberlo al leer los informes.
- [ ] Pasar a leer los informes por **eventos clave y sesiones con
      interacción**, no por usuarios.

### Aparte, y menor, pero se agrava con esta base instalada

- [ ] El aviso de cookies **vuelve a salir en cada visita** a quien no lo cierra:
      solo se guarda decisión al aceptar o rechazar
      (`src/components/ui/BannerCookies.astro`). Con cientos de equipos abriendo
      la portada cada mañana, eso es el mismo banner cada día para el mismo
      cliente. Conviene guardar «visto» al primer cierre.

---

## Lo que falta por saber

1. **¿En cuántos equipos se ha dejado la página de inicio configurada?** Es lo
   que decide la prioridad real de todo lo anterior.
2. **¿Qué dice el aviso naranja de la portada de GA4?** Sin desplegarlo no se
   sabe si es un umbral de privacidad, un periodo incompleto o una vinculación
   que falta.
3. **¿Qué eventos están marcados como clave** en *Administrar → Eventos*? De eso
   depende si los 18 de la semana pasada son 18 contactos o 18 de otra cosa.
