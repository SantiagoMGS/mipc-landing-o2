# Revisión legal pendiente: consentimiento, alturas y RETIE

> **Estado: no revisada por un abogado.** Este documento no es asesoría legal.
> Lo escribe quien hizo los cambios técnicos del 2026-08-16 para que un abogado
> colombiano pueda resolver los tres puntos en una sola pasada, con el texto
> exacto ya localizado.
>
> Es el hermano de `docs/revision-legal-garantias.md`, que sigue pendiente por
> su lado y trata cosas distintas.

## De dónde viene el problema

El 2026-08-16 se publicaron cambios que **afirman cosas sobre la ley** dentro
de texto comercial. No son cláusulas de un contrato: son frases de venta que
usan el derecho como argumento.

Eso las hace más delicadas de lo que parecen, por dos motivos:

1. Una afirmación legal equivocada en material publicitario es información
   engañosa al consumidor, aunque se haya escrito de buena fe.
2. Dos de las tres le dicen al cliente **qué responsabilidad tiene él**. Si la
   afirmación es incorrecta, no solo es un error de marketing: es haberle
   contado mal sus obligaciones a quien te está contratando.

Ninguna de las tres se inventó para vender. Las tres salen de decisiones
reales, están razonadas en el código y en los mensajes de commit, y se
publicaron a sabiendas de que faltaba esta revisión. Pero faltaba, y sigue
faltando.

---

## Los tres puntos

### 1. El consentimiento de cookies pasó de permiso previo a aviso

**Dónde:** `src/components/Analitica.astro` (el comportamiento) y
`/privacidad/`, apartado 6 (lo que se le dice al visitante).

**Qué cambió.** Hasta el 2026-08-16 el sitio arrancaba con las cuatro
categorías de medición y publicidad en `denied` y solo medía a quien pulsara
«Aceptar». Ahora **mide desde que el visitante entra** y el botón «Rechazar»
las desactiva.

**Qué dice hoy la política, literalmente:**

> «Están activas desde que entras, y puedes desactivarlas con un clic. […] **No
> usamos consentimiento previo porque la Ley 1581 de 2012 y el Decreto 1377 de
> 2013, que son los que nos aplican, no lo exigen para analítica**; te lo
> decimos así de claro en lugar de esconderlo.»

**Qué hay que revisar:**

| Punto | Por qué |
|---|---|
| Si la afirmación es correcta | La página **afirma qué exige la ley**. Si el criterio de la SIC sobre tratamiento de datos vía cookies analíticas es más exigente que eso, la frase es incorrecta y además está publicada como justificación |
| Si la analítica de Google trata datos personales aquí | La respuesta cambia si aplica o no el régimen de autorización previa del art. 9 de la Ley 1581 |
| El papel de Google como tercero | La política dice que «Google puede tratar esos datos como responsable independiente». Conviene confirmar que esa figura es la correcta frente a la de encargado del tratamiento |
| Si hace falta registro ante la SIC | Depende del tamaño de la empresa y de las bases de datos que administre. No se ha comprobado |

**Por qué se cambió, para que el abogado tenga el contexto:** el modelo
anterior no compraba lo que costaba. Quien ignoraba el aviso —la mayoría— se
quedaba en denegado para siempre **y** volvía a ver el banner en cada visita. Y
el consuelo habitual de que «Google compensa con conversiones modeladas» no
aplica a una cuenta nueva y pequeña, que no alcanza el volumen mínimo de
modelado: por debajo de ese umbral no se modela nada, simplemente no se
registra.

**Si la respuesta es que sí hace falta consentimiento previo**, revertir es un
cambio de una línea: en `Analitica.astro` los valores por defecto vuelven a
`denied` y la política vuelve a decirlo. Hay cuatro tests que fijan el modelo
actual (`tests/analitica.test.ts`) y habría que cambiarlos a propósito.

---

### 2. Se le dice al cliente que él responde si dejamos subir a alguien sin certificar

**Dónde:** `/servicios/camaras-de-seguridad/`,
`/servicios/instalaciones-electricas/` y el proyecto
`/proyectos/criadero-gente-buena/`.

**Qué dice, literalmente:**

> «En Colombia el trabajo en alturas está reglamentado, y la empresa que
> permite que alguien suba a una fachada de su predio sin certificación
> **responde por lo que pase ahí**. No responde el instalador: responde quien lo
> contrató y lo dejó subir.»

**Qué hay que revisar:**

| Punto | Por qué |
|---|---|
| Si el reparto de responsabilidad es ese | Es el corazón del argumento de venta. Se afirma que la responsabilidad recae en el contratante y no en el contratista, y esa atribución tan tajante conviene confirmarla |
| Qué exige exactamente la norma | La reglamentación de trabajo en alturas ha cambiado de resolución en los últimos años. El texto no cita ninguna a propósito — decir la equivocada sería peor que no decir ninguna |
| Qué obligaciones tiene MiPC como empleador | Más allá de la certificación del personal: programa de protección contra caídas, coordinador de trabajo en alturas, exámenes médicos. Nada de eso se afirma en el sitio, y conviene saber si hace falta antes de que un cliente institucional lo pida |

**Lo que sí está confirmado:** Santiago confirmó el 2026-08-16 que el personal
tiene la certificación vigente. Eso no está en duda. Lo que hay que revisar es
la **afirmación sobre la responsabilidad del cliente**, que es distinta.

**Si el reparto no es así**, la corrección es acotada: se mantiene la
certificación como diferenciador —que lo es— y se quita la frase sobre quién
responde. La página no pierde el argumento, pierde el énfasis.

---

### 3. «Cumplimos RETIE cuando el proyecto lo exige»

**Dónde:** `/servicios/instalaciones-electricas/`, sección propia y una
pregunta frecuente.

**Qué dice, literalmente:**

> «Cuando el proyecto exige certificación RETIE, la instalación se entrega
> cumpliéndola.»

**De dónde sale:** Santiago lo formuló así el 2026-08-16 — «cumplimos con RETIE
cuando el cliente lo exige»—. La redacción publicada respeta esa condición y en
ningún sitio dice «instalaciones certificadas RETIE», que sería una afirmación
general que nadie ha respaldado. Hay un test que impide que la condición se
caiga al reescribir un párrafo.

**Qué hay que revisar, y es lo que más pesa de los tres:**

| Punto | Por qué |
|---|---|
| Si el cumplimiento es opcional | Entiendo que para instalaciones nuevas, ampliaciones y modificaciones conectadas a la red el dictamen de inspección **lo pide la norma**, no el contratante. Si es así, «cuando el proyecto lo exige» describe mal la situación: no es que a veces se exija, es que a veces el cliente no lo pide aunque la norma sí |
| Quién responde si el cliente no lo pide | Es la pregunta práctica. Si un cliente decide no certificar una instalación que legalmente debía certificarse, hace falta saber qué exposición le queda a MiPC por haberla ejecutado |
| Si MiPC puede certificar o necesita un tercero | La certificación RETIE la emite un organismo de inspección acreditado. No está confirmado cómo se resuelve hoy: con personal propio con matrícula CONTE, con un tercero, o caso por caso |
| Si hace falta matrícula profesional para ejecutar | Independiente de la certificación de la obra terminada |

**Si resulta que la norma lo exige más veces de lo que la página sugiere**, la
corrección va **hacia decir más, no menos** — algo del estilo «toda instalación
que lo requiera se entrega certificada» —, así que publicar la redacción actual
no crea exposición nueva mientras tanto. Está anotado así en el frontmatter del
archivo.

---

## Qué se hizo y qué no

**Se hizo:** publicar las tres con la redacción más conservadora que permitía
el dato confirmado, dejar el razonamiento escrito en el código —no solo en el
commit— y poner tests donde una reescritura futura podría tumbar una condición
sin que nadie lo note.

**No se hizo, deliberadamente:** citar números de resolución, de artículo o de
decreto en el texto publicado, más allá de la Ley 1581 y el Decreto 1377 que ya
estaban en la política de privacidad desde antes. Citar la norma equivocada es
peor que no citar ninguna, y elegir cuál se cita es precisamente el trabajo del
abogado.

## Decisión que corresponde al cliente

1. **Dejarlo publicado y revisar después.** Es lo que hay hoy. De los tres, el
   punto 3 es el que menos preocupa —la corrección probable es ampliar la
   afirmación— y el punto 1 es el que más, porque cambia el comportamiento del
   sitio y no solo lo que dice.
2. **Revertir el consentimiento mientras se revisa.** Es una línea, y devuelve
   el sitio al modelo de permiso previo. Cuesta datos de medición justo cuando
   se va a empezar a pautar.
3. **Consulta acotada.** Con este documento son tres preguntas concretas sobre
   texto que ya existe, no una redacción desde cero. Y son del mismo abogado y
   el mismo marco que `revision-legal-garantias.md`, así que conviene llevar
   los dos documentos a la misma consulta.

**Recomendado: el 3, junto con la revisión de garantías.** Dos encargos
separados sobre el mismo sitio cuestan más que uno, y el de garantías lleva
pendiente desde antes del corte de dominio.
