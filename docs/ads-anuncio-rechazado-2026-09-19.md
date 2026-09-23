# La campaña no puede lanzarse: el anuncio está rechazado

> **CIERRE (2026-09-23).** Este documento propone conseguir la certificación
> de «Third Party Consumer Technical Support» y prepara un texto para soporte.
> **Ese camino no existe.** Comprobado en la propia cuenta: la lista de
> categorías que admiten solicitud de certificación **no incluye soporte
> técnico al consumidor**. No hay formulario que llenar ni apelación que
> ganar. Ver «El cierre: no hay certificación que pedir», al final.
>
> Lo que sí se resolvió: la verificación de anunciante quedó completa el
> 2026-09-22. No desbloquea nada de esto.
>
> **Decisión:** se deja de insistir por reparación y la pauta se mueve a las
> líneas B2B, que esa política no toca.

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

---

## Las verificaciones de cuenta, que nadie había mirado

El **Administrador de políticas** (*Admin → Policy → Summary*) mostraba el mismo
2026-09-19 que el anuncio no era el único problema: **«You have 3 account issues
and 1 ad issue»**. Los tres de cuenta no estaban registrados en ningún sitio.

| Problema | Estado inicial | Estado al cierre del día |
|---|---|---|
| Confirmation of advertising funding source | **required** | ✅ resuelto |
| EU political ads status confirmation | recommended | ✅ resuelto |
| Advertiser verification – Dun & Bradstreet | recommended | ⏳ `In review`, enviado el 2026-09-19, hasta 5 días hábiles |

**La confirmación de fuente de financiación** pregunta quién paga los anuncios y
la respuesta **se publica en el Centro de Transparencia de Anuncios**. Google
avisa de que el dato no se verifica, pero es visible para cualquiera que vea un
anuncio de MiPC.

**El D-U-N-S se dejó vacío**, por ser opcional: es un identificador de Dun &
Bradstreet sin relación con el NIT, cuya única ventaja es acelerar la
verificación. No compensaba frenar el trámite semanas para conseguir uno.

### Un dato que refuerza todo lo demás

El formulario de verificación traía la dirección **idéntica a
`src/data/empresa.ts`**, código postal `050030` incluido — el mismo que se copió
de la ficha de Google Business en agosto. Sitio, ficha y verificación de
anunciante dicen ahora lo mismo. Para una verificación de identidad, tres
fuentes coincidiendo es exactamente la señal que hace falta.

### Anomalía sin confirmar

Una captura tomada en el instante del envío mostraba este mismo aviso como
**«required»** y con fecha **«Submitted … on August 17, 2026»**. La página en
vivo, consultada minutos después, decía «recommended» y «September 19, 2026».

Lo más probable es que la captura recogiera el estado anterior al refresco. Pero
**si esa fecha de agosto era real, la verificación llevaba un mes sin
resolverse**, muy por encima de los cinco días hábiles anunciados, y eso sería
motivo para reclamar. Si vuelve a aparecer una fecha vieja, comprobarlo.

### Lo que NO desbloqueó

**El anuncio sigue `INELIGIBLE`.** Era lo esperable: el rechazo por categoría
restringida es independiente de la verificación de anunciante. Completar las
verificaciones no lo toca.

---

## No hay apelación autoservicio para esto

Se buscó el control de apelación y **no existe**. En el Administrador de
políticas, la única acción que Google ofrece para este anuncio es un botón
**«Start»** que **abre el editor del anuncio**, no un formulario de apelación.

Eso es en sí mismo la respuesta: para categorías restringidas que exigen
certificación previa, Google no ofrece apelación autoservicio. El camino es la
certificación, o soporte.

**El anuncio se dejó intacto a propósito.** Editarlo y guardarlo lo reenvía a
revisión como anuncio nuevo y anularía cualquier apelación en curso. El editor
se abrió por error al pulsar «Start» y se cerró sin guardar.

## El texto preparado para soporte

Verificado contra el propio sitio antes de darlo por bueno. **Un primer borrador
afirmaba «no prestamos soporte técnico remoto bajo ninguna modalidad», y era
falso**: `src/content/servicios/soporte-ti-empresarial.md` anuncia «mesa de
ayuda, soporte remoto y en sitio por contrato mensual». Un revisor de Google que
abriera mipc.com.co lo habría visto. Una declaración falsa contradicha por el
propio sitio del anunciante no solo hunde la solicitud: pone la cuenta en
riesgo.

Santiago confirmó el 2026-09-19 que **el soporte remoto es exclusivamente para
empresas con contrato mensual, nunca para particulares**. Con ese matiz el
argumento sigue en pie y es más creíble:

> MiPC Tecnología S.A.S. (NIT 901401211-7) es un taller físico de reparación de
> hardware en Medellín, Colombia, en operación desde 2009.
>
> Dirección: Carrera 66A # 34-48, Interior 101, Laureles, Medellín, Antioquia.
> Contamos con ficha de Google Business Profile verificada en esa dirección.
>
> El anuncio rechazado promociona un servicio exclusivamente presencial:
> recogemos físicamente el equipo en la dirección del cliente dentro del área
> metropolitana de Medellín, lo reparamos en nuestro taller y lo devolvemos. El
> propio anuncio lo describe: «Recogemos tu computador gratis en Medellín y te
> lo devolvemos reparado». No hay intervención remota en ese servicio.
>
> Para transparencia: prestamos también servicios gestionados de TI a empresas
> bajo contrato mensual, que incluyen soporte remoto. Ese servicio es
> exclusivamente corporativo y contratado, con clientes identificados, y no se
> ofrece a consumidores ni se promociona en esta campaña.
>
> No realizamos contacto no solicitado, no ofrecemos asistencia telefónica de
> pago a consumidores y no solicitamos acceso remoto a equipos de particulares.
>
> El sitio publica el precio del diagnóstico, los términos de la garantía y las
> condiciones del servicio antes de cualquier contacto comercial.
>
> Solicitamos la revisión entendiendo que el servicio anunciado es reparación
> física de hardware en taller, no asistencia técnica remota a consumidores.

**La pregunta que decide todo**, y que hay que hacerle a soporte: **¿está
disponible para Colombia la certificación de soporte técnico de terceros?** Si
no lo está, esta línea de anuncios no está aplazada sino cerrada, y el
presupuesto debe girar a las líneas B2B —que `planificador-otros-servicios-2026-09-19.md`
mide pequeñas, pero anunciables—.

## Lo que esto corrige

`campana-reparacion-especificacion.md` debe dejar de decir que no hay
prohibición que impida lanzar. La hay, es previa, y es la explicación más
probable de por qué esa campaña «nunca se envió»: puede que sí se intentara y
que el rechazo pasara inadvertido.

---

## El cierre: no hay certificación que pedir (2026-09-23)

### Lo que se comprobó

En **Admin → Policy → Account**, el botón «See if your product or service
needs an application» abre la lista **completa** de categorías que admiten
solicitud de certificación en la cuenta:

> Abortion-related keywords · Addiction services · Alcohol · Complex
> speculative financial products · Copyrights · Cryptocurrency-related ·
> Dating & companionship · Dating services in Japan · Debt services ·
> Elections · Event ticket sale · Financial products & services · Financial
> services in the United Kingdom · Free desktop software · Gambling & games ·
> Government documents and services · Healthcare · Personalized · Prediction
> markets · Recreational drugs · Social casino games

**«Third Party Consumer Technical Support» no está.** Veintiuna categorías y
ninguna es esta.

Eso convierte la pregunta abierta desde el 19 —«¿hay certificación de soporte
técnico para Colombia?»— en una respuesta: **no por la vía de autoservicio.**
No hay formulario, así que el texto preparado más arriba para soporte no tiene
dónde entregarse por esta ruta.

### Estado del anuncio ese día

| | |
|---|---|
| Campaña «Reparacion Medellin Computadores» | `Not eligible` |
| Anuncio | `Disapproved (Third Party Consumer Technical Support)` |
| Impresiones · clics · gasto | 0 · 0 · **COP 0** |

Sin tocar nada: editar el anuncio lo reenvía a revisión.

### La verificación sí se completó, y no sirve para esto

Todas las tareas de **Advertiser Verification** en verde:

| Tarea | Fecha |
|---|---|
| Preguntas sobre la organización | 2026-08-16 |
| Datos de Dun & Bradstreet | 2026-09-21 |
| **Google Ads verificó la afiliación** | **2026-09-22** |
| Anuncios políticos de la UE (no aplica) | 2026-09-19 |
| Quién paga los anuncios | 2026-09-19 |

`MI PC TECNOLOGIA S.A.S` queda verificada. **No desbloquea el rechazo**: son
dos requisitos distintos, y este documento ya lo advertía en «Lo que NO
desbloqueó».

*(El **resumen** de políticas seguía listando la verificación como asunto
abierto el 2026-09-23, con un botón «Start». Está desactualizado. Manda la
página de detalle, `Admin → Policy → Account`.)*

### Qué significa de verdad

No es un trámite atascado. **La reparación de computadores a particulares es
justamente el servicio que Google no deja anunciar.** La política existe por
el fraude de soporte remoto y no distingue entre eso y un taller con dirección
física, NIT y quince años de operación.

Duele menos de lo que parece, y hay un dato de este mismo repositorio que lo
dice: `planificador-palabras-clave-medellin.md` midió que la pauta podía traer
**8–15 equipos al mes, un 7–15% de la capacidad** de dos técnicos. El canal
pagado nunca iba a llenar el taller. Lo que se pierde es un complemento, no el
motor.

### Lo que sí está abierto

**Las otras cuatro líneas no caen en esa política.** Redes de datos, cámaras de
seguridad, instalaciones eléctricas y soporte TI **empresarial** son B2B, no
«consumer technical support». Su volumen ya está medido en
`planificador-otros-servicios-2026-09-19.md`.

Decidido el 2026-09-23: **la siguiente campaña se arma sobre cámaras de
seguridad.**

### Lo que NO hay que volver a intentar

- **Apelar el anuncio.** No hay apelación que ganar cuando la categoría exige
  una certificación que no se puede solicitar.
- **Escribir a soporte pidiendo la certificación.** El texto de más arriba se
  conserva como registro de lo que se creyó; no hay ruta donde entregarlo.
- **Reescribir el anuncio para que «no parezca» soporte técnico.** La política
  mira el servicio, no las palabras. Y disfrazarlo sería la clase de
  declaración falsa que este mismo documento estuvo a punto de hacer una vez.
