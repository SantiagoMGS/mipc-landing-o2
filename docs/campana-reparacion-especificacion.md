# Campaña de reparación de computadores: especificación para montar

Escrita el **2026-08-18**. Es la primera campaña de la cuenta `230-212-2952`.
Todo lo de aquí está listo para pegar; los límites de caracteres ya están
verificados.

**Léase antes:** `docs/planificador-palabras-clave-medellin.md`, que es donde
está medido el tamaño del canal. El resumen que gobierna esta campaña: el
mercado da para **8–15 equipos al mes**, un 7–15% de la capacidad de dos
técnicos. Es un complemento, no el motor del taller.

---

> ## ⚠️ CORRECCIÓN DEL 2026-08-27, LEER ANTES QUE NADA
>
> **Esta campaña nunca se envió.** Lo aclaró Santiago el 2026-08-27, al leer un
> análisis de GA4 que daba por hecho que llevaba nueve días corriendo.
>
> La sección de abajo se titulaba «Publicada el 2026-08-18» y describía la
> campaña montada en la cuenta como si estuviera sirviendo. **No lo estaba.** Se
> configuró siguiendo esta especificación, pero no se llegó a poner en marcha.
>
> **Consecuencias para quien lea esto:**
>
> - **No hay gasto, no hay clics pagados y no hay ninguna tasa medida.** Las dos
>   que esta campaña existía para medir —clic→contacto (8%) y contacto→taller
>   (40%)— **siguen siendo estimaciones sin un solo dato detrás**.
> - **La tabla de umbrales de «Cómo se decide si sigue o se apaga» no se ha
>   aplicado nunca.** Nada que apagar, nada que subir.
> - **Las fechas del 2026-08-18 al 2026-09-08 están vencidas.** La ventana nueva
>   está fijada abajo, en «La ventana de prueba».
> - **El bono de 350 US$ de la cuenta vence el 2026-10-15.** Sigue sin usarse, y
>   **no debe decidir nada** — ver «El bono no gobierna esta campaña».
>
> **Anomalía pendiente de cerrar:** GA4 registra **10 sesiones de `Paid Search`**
> entre el 2026-07-30 y el 2026-08-26, que con la campaña sin lanzar no deberían
> existir. Hay que comprobar en Ads —*Campañas* con el filtro de estado en
> **«Todas»**, y *Facturación → Resumen*— que no haya nada sirviendo ni cobrado.
> Hasta que eso se confirme, **no dar por hecho que el gasto es cero**.
>
> Lo que sigue siendo válido: **todo lo demás**. La configuración, las 14
> palabras clave, las negativas, los anuncios, los recursos, los umbrales de
> decisión y los errores que no hay que cometer. Es una especificación lista
> para montar, que es lo que el título dice. Solo hay que dejar de leerla como
> el registro de algo que ocurrió.

## La ventana de prueba

Fijada el **2026-09-13**, al confirmarse que no había ninguna prohibición de
Google que impidiera lanzar (ver «Palabras clave»).

| | |
|---|---|
| **Inicio** | **martes 2026-09-15** |
| **Fin** | **martes 2026-10-06** |
| Duración | **22 días** |
| Techo de gasto | ~**374.000 COP** (22 × 17.000) |

Misma forma que la ventana original —también 22 días, también arrancando en
martes—, así que todo lo previsto para aquella sigue valiendo tal cual.

**Antes de pulsar publicar hay que cerrar la anomalía de las 10 sesiones de
`Paid Search`.** Está descrita en la corrección de arriba. Si algo estuviera
sirviendo, lanzar encima mezcla dos gastos y arruina la medición, que es el
único propósito de esta campaña.

**Si al 6 de octubre no se han alcanzado los 30 contactos, se extiende la
ventana; no se decide.** La previsión del planificador daba ~26 con el
presupuesto de 17.000, ya por debajo del umbral. Aplicar la tabla de «Cómo se
decide si sigue o se apaga» con una muestra corta es peor que esperar: con 15
contactos, un par de casualidades mueven el costo por contacto de 12.000 a
28.000 y se apagaría algo que funciona.

## El bono no gobierna esta campaña

Los 350 US$ son del orden de **1,4 millones de COP**. A los 17.000 COP/día que
admite el inventario medido, consumirlos llevaría unos **84 días**: cuatro veces
la ventana de prueba. **Dentro de esta campaña el bono es inalcanzable, y eso
no es un problema que haya que resolver.**

Antes de darle importancia a la fecha del 2026-10-15 hay que **leer los términos
del crédito**, porque los de Google Ads casi siempre funcionan igual: se aplica
el código y hay que **gastar un importe equivalente dentro de un plazo** para
ganarlo.

- Si el 15 de octubre es la fecha límite para **aplicar el código**, no hay
  ninguna prisa: se aplica y se consume a lo largo de meses.
- Si es la fecha para **haber gastado** los 350 US$, el bono se suelta. No se
  persigue.

**Lo que no se hace en ninguno de los dos casos es subir el presupuesto para
alcanzarlo.** El techo de esta campaña no es de dinero, es de inventario: solo
«reparación de computadores» llega al cubo de 100–1.000 búsquedas/mes en
Medellín. Gastar 60.000 COP/día significa pagar clics de gente que no está
buscando reparar un computador, y eso **corrompe justamente las dos tasas que
esta campaña existe para medir**.

## Por qué esta campaña puede competir, y antes no

La `auditoria-reparacion-medellin.md` (§5) concluyó que MiPC salía a la subasta
en desventaja: la competencia ofrecía **domicilio** y **diagnóstico gratis**
contra un taller que cobraba $25.000. **Eso dejó de ser cierto el 2026-08-16**,
cuando se reescribió la página:

- **Recogida y devolución a domicilio, gratis**, en los seis municipios de
  `zonaServicio`, máximo un día hábil, y **no condicionada** a que se autorice
  la reparación.
- **Diagnóstico sin costo si se autoriza** — que con el 90% de autorización
  medido es el caso de nueve de cada diez clientes.

La oferta ya está a la par. Lo que MiPC no hace es reparar *dentro* de la casa,
y eso es una ventaja que hay que contar, no un defecto que esconder: el banco de
trabajo hace mejor trabajo que la mesa del comedor.

## Configuración de la campaña

| Ajuste | Valor | Por qué |
|---|---|---|
| Tipo | **Búsqueda** | |
| Objetivo | Sin objetivo / Clientes potenciales | |
| **Redes** | **Solo Google. Display NO, socios de búsqueda NO** | Es donde se evapora el presupuesto de las cuentas nuevas sin que nadie lo note |
| Presupuesto | **17.000 COP/día** | Corregido el 2026-09-13: los 13.000 originales dejaban la muestra en ~18 contactos, por debajo de los 30 que exige la tabla de decisión. Ver abajo |
| Puja | **Maximizar clics, con límite de CPC de 2.000 COP** | Sin historial de conversiones, «Maximizar conversiones» gasta el presupuesto explorando. El tope de 2.000 protege del extremo de 10.128 sin dejar fuera la media de 1.082–1.202 |
| Ubicaciones | **Medellín, Envigado, Sabaneta, Itagüí, Bello, La Estrella** | Exactamente `zonaServicio` de `empresa.ts`: donde llega la recogida gratis |
| Opción de ubicación | **«Presencia: personas en tus ubicaciones»** | El valor por defecto incluye a quien solo *muestra interés*, y eso trae clics de otras ciudades |
| Idioma | Español | |
| **Horario** | **Lun–Vie 8:30–17:00 · Sáb 9:00–13:00** | Igual que `empresa.horario`. Pagar un clic a las 11 de la noche, cuando nadie contesta el WhatsApp hasta el otro día, es regalar el cliente al competidor que sí conteste |
| Rotación de anuncios | Optimizar | |

**Sobre el presupuesto:** que Google no gaste los 17.000 algunos días **es
normal y esperado**. Significa que no hubo búsquedas suficientes, que es justo
lo que midió el planificador. No es una avería y no se arregla subiendo el
presupuesto.

> **Corregido el 2026-09-13.** Esta tabla decía **13.000 COP/día** y un tope de
> CPC de **1.200**, mientras la sección «Montada el 2026-08-18» explicaba que en
> la cuenta se había puesto **17.000** y **2.000**, con su razonamiento. Quien
> viniera a lanzar leería primero la tabla y montaría la campaña equivocada. La
> tabla manda ahora, y los valores son los de la cuenta.

## Grupo de anuncios único: «Reparación – general»

URL final: `https://mipc.com.co/servicios/reparacion-de-computadores/`

### Palabras clave

Todas en **concordancia de frase** (entre comillas). Nada de amplia al empezar.

```
"reparación de computadores"
"reparación de computadores medellín"
"reparación de portátiles"
"reparación de laptops"
"reparación de pc"
"arreglo de computadores"
"arreglo de computadores medellín"
"técnico de computadores"
"técnico de computadores cerca de mi"
"mantenimiento de computadores"
"mantenimiento de computadores medellín"
"reparar computador"
"cambio de pantalla portátil"
"reparación de macbook"
```

**`"servicio técnico de computadores"` NO se puede usar.** Google la rechaza el
2026-08-18 por la política **«Third Party Consumer Technical Support»**, que
restringe los anuncios de soporte técnico prestado por terceros —nació por las
estafas de «soporte técnico» telefónico— y exige certificación previa. Ser un
taller legítimo con dirección física no lo evita: la marca la pone un
automatismo sobre el texto de la palabra clave. Se retiró; su volumen estaba en
el rango de 10–100 y lo que cubría lo recogen `"reparación de computadores"` y
`"reparar computador"`. Si algún día se quiere ese segmento, hay que pedir la
certificación **antes**, no con una campaña esperando aprobación. Vigilar si el
clasificador arrastra también las variantes de `"técnico de computadores"`.

> **Aclarado el 2026-09-13.** Santiago recordaba esto como «Google nos prohibió
> publicitar reparaciones». **No fue eso.** Fue **una sola palabra clave
> rechazada**, de volumen 10–100; las otras 14 pasaron, incluida la principal
> `"reparación de computadores"`. No hubo aviso de cuenta, ni anuncio rechazado,
> ni restricción de categoría. **La campaña nunca estuvo bloqueada** — y durante
> tres semanas esa idea equivocada fue la razón para no lanzarla.
>
> Lo que dispara el clasificador es el **lenguaje de asistencia remota**
> —«servicio técnico», «soporte técnico», «asistencia técnica»—, porque la
> política nació por las estafas de soporte telefónico. El lenguaje de
> reparación física —«reparación», «arreglo», «taller», «cambio de pantalla»,
> «recogemos tu equipo»— no lo activa, y es exactamente el que usan las 14
> palabras clave y los anuncios de esta especificación.

**No se añaden términos con «a domicilio», y tampoco se niega esa palabra.** La
concordancia de frase sobre los términos principales ya recoge esas consultas
—`"reparación de computadores"` casa con «reparación de computadores a
domicilio»—, y como la recogida es gratis, ese tráfico es legítimo. El titular
«Recogemos tu Equipo Gratis» fija la expectativa antes del clic. Comprarlas
aparte no compensa: son las de competencia Alta y pujas de hasta 6.394 COP.

### Palabras clave negativas

```
gratis, cómo, como reparar, tutorial, youtube, pdf, manual, curso, cursos,
empleo, trabajo, vacante, software, programa, descargar, driver, repuestos,
usados, comprar, venta, papelera, recuperar archivos, celular, iphone,
impresora, consola, xbox, playstation, televisor, lavadora, nevera
```

`recuperar archivos` y `papelera` son las importantes: el planificador encontró
**729 palabras clave de recuperación de datos**, casi todas de gente buscando
software gratuito, y con pujas altas. Sin esas negativas se comen el presupuesto
en una tarde.

### Anuncio adaptable de búsqueda

**15 titulares** (máximo 30 caracteres, verificados):

```
Reparación de Computadores
Reparamos tu PC en Medellín
Recogemos tu Equipo Gratis
Recogida a Domicilio Gratis
Diagnóstico Sin Costo
Garantía de 30 Días
Reparación de Portátiles
¿No Enciende? Lo Revisamos
Cualquier Marca, También Mac
Pantallas, Teclados, Baterías
Cotizamos Antes de Reparar
Taller Propio en Laureles
En Medellín Desde 2009
Escríbenos por WhatsApp
Servicio Técnico de PC
```

**4 descripciones** (máximo 90 caracteres, verificadas):

```
Recogemos tu computador gratis en Medellín y te lo devolvemos reparado. Garantía 30 días.
El diagnóstico no te cuesta nada si autorizas la reparación. Cotizamos antes de tocar.
Cualquier marca: HP, Lenovo, Dell, Asus, Acer y Apple. Taller propio en Laureles.
Pantallas, teclados, baterías, discos y virus. Escríbenos por WhatsApp y lo recogemos.
```

**Fijaciones:** ninguna, salvo una — fijar **«Reparación de Computadores» en la
posición 1**. El resto se deja rotar: con tan pocos datos, el algoritmo aprende
más rápido que nosotros qué combinación funciona.

Todas las afirmaciones del anuncio son verificables en la página de destino, que
es lo que exige la política de Google y lo que sostiene el nivel de calidad: la
recogida gratis, los 30 días de garantía, el diagnóstico sin costo si autoriza,
las marcas y la dirección están todas en `reparacion-de-computadores.md`.

### Recursos (antes «extensiones»)

- **Llamada: NO, durante la prueba.** Corregido el 2026-08-18, el mismo día: la
  primera versión de este documento la incluía. Un recurso de llamada permite
  marcar **sin pasar por el sitio**, y esa llamada no dispara `clic_telefono`
  —que solo existe al pulsar el teléfono *en la página*—; como el seguimiento de
  llamadas de Ads se dejó fuera a propósito, esos contactos ocurrirían sin
  contarse. El resultado sería el peor posible para una campaña cuyo fin es
  medir: costo por contacto inflado y riesgo de apagar algo que funcionaba.
  Durante las tres semanas, **todo el contacto pasa por el sitio**. Se añade
  después, junto con su conversión de llamadas bien configurada.
- **Enlaces del sitio:** Preguntas frecuentes · Garantías · Contacto · Alquiler
  de equipos.
- **Textos destacados:** Recogida gratis · Garantía 30 días · Cualquier marca ·
  Taller en Laureles · Cotización previa · Desde 2009.
- **Fragmentos estructurados** (encabezado «Servicios»): Pantallas · Teclados ·
  Baterías · Discos duros · Virus · Sistema operativo.
- **Ubicación:** vincular la ficha de Google (CID `15154712519055002689`).

## Cómo se decide si sigue o se apaga

La conversión que cuenta es **Contacto** —`clic_whatsapp` y `clic_telefono`—, no
el formulario, que es el canal B2B. Ya están importadas y «Contacto» es objetivo
predeterminado de la cuenta.

| Umbral | Qué significa | Qué hacer |
|---|---|---|
| **> 25.000 COP por contacto** a los 30 contactos | Por encima del punto de equilibrio | Apagar |
| 15.000–25.000 COP | Funciona, con margen estrecho | Mantener y optimizar |
| **< 15.000 COP** | Funciona bien | Subir presupuesto sin dudarlo |

El punto de equilibrio sale de: ticket 120.000 COP × 90% de autorización, menos
repuestos, repartido por la tasa de contacto→taller. **Falta afinar qué
porcentaje del ticket se va en repuestos**; como los técnicos ya están pagados,
ese es el único costo variable que importa.

Las dos tasas que gobiernan todo —**clic→contacto** (estimada en 8%) y
**contacto→taller** (40%)— siguen siendo estimaciones. **Medirlas es el
propósito real de esta primera campaña**, más que las ventas que traiga.

## Montada el 2026-08-18 — pero NUNCA ENVIADA

> **Esta sección se titulaba «Publicada el 2026-08-18».** Corregido el
> 2026-08-27: la campaña se configuró en la cuenta pero **no se llegó a
> enviar**, así que nunca sirvió un anuncio. Ver la corrección de arriba. Lo
> que sigue describe **cómo quedó montada**, que es información útil para
> retomarla, no un registro de algo que estuvo en marcha.

Nombre en la cuenta: **«Reparacion Medellin Computadores»**. Se montó siguiendo
esta especificación, con tres desviaciones, todas anotadas arriba en su sitio:

- **Presupuesto 17.000 COP/día**, no 13.000. El propio planificador de Ads
  estimó el CPC medio en **1.082–1.202 COP**, y con 13.000 la muestra se
  quedaba en ~18 contactos en tres semanas, por debajo de los 30 que hacen
  falta. Con 17.000 la previsión da **110 clics semanales**, unos 330 en la
  prueba: ~26 contactos. Total ~357.000 COP, con la fecha de fin como techo.
- **Límite de CPC 2.000, no 1.200.** Un tope de 1.200 con un CPC medio de 1.082
  dejaba fuera de buena parte de las subastas: el límite protege del extremo de
  10.128, no de la media.
- **14 palabras clave, no 15** — ver la nota sobre «servicio técnico de
  computadores» y la política de soporte técnico de terceros.

**Sobre el bloque «IA Max» del resumen final:** dice «Personalización de texto y
Expansión de URL final activadas», y **es una etiqueta engañosa**. Se verificó
en la configuración: el interruptor está apagado, las dos casillas desmarcadas
y en gris. El resumen lista los nombres de los ajustes, no su estado. La línea
que sí informa es *«Correspondencia de términos de búsqueda: usando solo tus
palabras clave y tipos de concordancia»*. No hace falta volver a asustarse.

**Lo primero que hay que mirar cuando haya datos** no son los clics: es el
**informe de términos de búsqueda**, para ver por qué búsquedas reales cobran y
añadir negativas. Ahí es donde se recupera presupuesto en la primera semana.

## Errores que no hay que cometer

- **No** activar Display ni socios de búsqueda.
- **No** empezar con «Maximizar conversiones» ni CPA objetivo: sin historial no
  hay nada que optimizar. Se cambia al llegar a 15–30 conversiones.
- **No** usar concordancia amplia al principio.
- **No** dejar el horario 24/7.
- **No** subir el presupuesto porque «no se gasta»: el techo es de inventario.
- **No** juzgar antes de 30 contactos.
