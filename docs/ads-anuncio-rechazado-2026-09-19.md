# La campaña no puede lanzarse: el anuncio está rechazado

Descubierto el **2026-09-19** al intentar lanzar la campaña de reparación,
cuenta `230-212-2952`.

Esto **contradice el supuesto** sobre el que `campana-reparacion-especificacion.md`
fijó su ventana de prueba: allí se lee que la fecha se fijó el 2026-09-13 «al
confirmarse que no había ninguna prohibición de Google que impidiera lanzar».
La hay, y lleva puesta desde antes.

---

## Lo que se hizo y lo que se encontró

**Arreglado:** la campaña estaba en estado `Ended` con la ventana original
—18 ago → 8 sep 2026—, once días vencida. **La fecha de fin se movió al
2026-10-11**, que da los 22 días completos que el presupuesto de 17.000 COP/día
contempla si se arranca hoy.

**Lo que apareció al arreglarla:** el estado no pasó a activo sino a
**`Not eligible`**, y la causa está dos niveles más abajo.

| Nivel | Estado |
|---|---|
| Campaña `Reparacion Medellin Computadores` | Habilitada, `Not eligible` |
| Grupo `Grupo de anuncios 1` | `Not eligible` — **All ads disapproved** |
| Anuncio (responsive search ad, el único) | **Disapproved (Third Party Consumer Technical Support)** |

El anuncio es:

> **Reparación de Computadores · Repara tu PC en Medellín · Recogemos tu Equipo
> Gratis**
> Recogemos tu computador gratis en Medellín y te lo devolvemos reparado.
> Garantía 30 días…

---

## Qué significa ese rechazo

«Third-party consumer technical support» es una **política restringida** de
Google, creada contra el fraude de soporte técnico telefónico y remoto. Bajo
ella, un tercero que ofrece soporte técnico a consumidores —es decir, que no es
el fabricante ni el vendedor del producto— **solo puede anunciarse si Google lo
ha certificado previamente**.

No es un problema de redacción del anuncio: cambiar los titulares no lo
resuelve. Es una clasificación del negocio.

**Y no se resuelve gastando más ni esperando.** Mientras el anuncio esté
rechazado, la campaña no sirve una sola impresión, tenga las fechas que tenga y
esté habilitada o no. Explica por qué la cuenta lleva COP 0 de gasto desde
siempre.

---

## El argumento para apelar, que parece sólido

La política apunta a soporte **remoto**: quien llama por teléfono, pide acceso
al equipo y cobra por arreglar algo que a menudo no existe. **MiPC hace lo
contrario y puede demostrarlo:**

- Es un **taller físico** con dirección verificable —Carrera 66A # 34-48,
  Laureles, Medellín— y ficha de Google Business verificada (CID
  `15154712519055002689`).
- **Recoge el equipo a domicilio y lo repara físicamente.** El propio anuncio
  rechazado lo dice: «Recogemos tu computador gratis y te lo devolvemos
  reparado». No hay intervención remota en el servicio.
- Tiene **NIT registrado** (`901401211-7`) y diecisiete años de operación.
- El sitio publica precio de diagnóstico, garantía y condiciones.

Ese conjunto es exactamente lo que una apelación necesita: demostrar que se
trata de reparación de hardware presencial y no de soporte técnico remoto.

---

## Lo que hay que hacer, en orden

1. **Apelar el rechazo** desde el propio anuncio en Ads —«Ver detalles de la
   política» → apelar—, argumentando taller físico con recogida y devolución.
   Adjuntar lo que Google pida: NIT, dirección, ficha.
2. **Si la apelación falla, solicitar la certificación** de soporte técnico de
   terceros. Es un trámite de verificación de Google, no inmediato.
3. **Mientras tanto no tiene sentido tocar presupuesto ni pujas.** Nada de eso
   se activa con el anuncio rechazado.

## Pendiente de verificar

**La URL que muestra el anuncio es `mipc.com.co/reparacion/medellin`, y esa
ruta devuelve `404`.** Comprobado el mismo día con `curl`.

**Cuidado con esta observación**: en un anuncio de búsqueda adaptable, ese texto
suele ser la **URL visible** —dominio más dos campos de ruta decorativos— que
**no tiene por qué existir**, mientras la URL final apunta a otro sitio. Las dos
cosas se parecen en la tabla de anuncios y se confunden con facilidad.

Hay que abrir el anuncio y mirar el campo **URL final**. Si resultara ser
`/reparacion/medellin`, habría un segundo problema independiente del rechazo, y
el destino correcto es `https://mipc.com.co/servicios/reparacion-de-computadores/`
(responde `200`).

## Lo que esto corrige

`campana-reparacion-especificacion.md` debe dejar de decir que no hay
prohibición que impida lanzar. La hay, es previa, y es la explicación más
probable de por qué esa campaña «nunca se envió»: puede que sí se intentara y
que el rechazo pasara inadvertido.
