# Estado real de la cuenta de Google Ads

Leído el **2026-09-19** en la interfaz de Google Ads, cuenta `230-212-2952`
(`santiago.martinez@mipc.com.co`), sobre el rango que la propia cuenta mostraba:
**2026-08-16 → 2026-09-18**.

Es una lectura, no un cambio: no se tocó ninguna campaña, presupuesto ni acción
de conversión.

Este documento existe para cerrar dos preguntas que `campana-reparacion-especificacion.md`
dejó abiertas y que bloqueaban el lanzamiento.

---

## Medido

### 1. No hay nada sirviendo

Aviso de la propia cuenta, en todas las pantallas:

> **None of your ads are running** — Your campaigns and ad groups are paused or
> removed. Enable them to begin showing your ads.

La ventana de prueba fijada en `campana-reparacion-especificacion.md` era
**2026-09-15 → 2026-10-06**. Empezó hace cuatro días y **no ha arrancado**.

### 2. Gasto cero, desde siempre

*Billing → Summary*:

| | |
|---|---|
| Saldo | **COP 0** |
| Último pago | «You haven't made any payments yet» |
| Agosto 2026 | Costo neto **COP 0** |
| Septiembre 2026 | Costo neto **COP 0** |

### 3. Las tres acciones de conversión existen

*Goals → Conversions → todas las acciones*:

| Acción | Fuente | Estado | Conversiones |
|---|---|---|---|
| Envío de formulario para clientes potenciales | Website | **Needs attention** | 0,00 |
| `mipc.com.co (web) clic_whatsapp` | Website (Google Analytics GA4) | No recent conversions | 0,00 |
| `mipc.com.co (web) clic_telefono` | Website (Google Analytics GA4) | No recent conversions | 0,00 |

Las tres son **primarias** y están incluidas en los objetivos de la cuenta. Los
objetivos agrupados quedan así: **Contact** activo (1 de 1 campañas), **Submit
lead form** en «Needs attention» (0 de 1 campañas).

*Goals → Diagnostics* añade: **1 acción de conversión mejorada con «urgent
issues»**. El panel de detalle no llegó a renderizar, así que **cuál es el
problema concreto sigue sin leerse**.

---

## Interpretado

### La anomalía de las 10 sesiones de `Paid Search` queda cerrada

`campana-reparacion-especificacion.md` exigía, antes de lanzar, explicar 10
sesiones de `Paid Search` que GA4 registró entre el 2026-07-30 y el 2026-08-26
con la campaña sin publicar, y advertía: «hasta que eso se confirme, no dar por
hecho que el gasto es cero».

**Confirmado: el gasto es cero.** La cuenta no ha hecho ningún pago en toda su
existencia y el costo neto de agosto y septiembre es COP 0. Esas 10 sesiones no
pueden proceder de esta cuenta. Lo más probable es una atribución equivocada de
GA4 —una visita con un parámetro que GA4 leyó como pago—, no gasto oculto.

**Consecuencia: ya no hay nada que bloquee el lanzamiento por este motivo.**

### Los tres ceros NO prueban que la medición esté rota

Es la conclusión fácil y sería falsa. **Google Ads solo cuenta conversiones
atribuibles a un clic en un anuncio.** Sin un solo anuncio servido, cero
conversiones es el resultado correcto, no un síntoma.

De ahí se sigue algo incómodo: **la pregunta «¿llegan las conversiones a Ads?»
no se puede responder desde Ads mientras no haya corrido ninguna campaña.** Ver
ceros aquí y concluir que la instrumentación falla es tan erróneo como ver ceros
y concluir que funciona.

La verificación tiene que hacerse **sobre el sitio en vivo**, con Tag Assistant
o con GA4 en tiempo real, disparando los eventos a mano. Es exactamente lo que
pedía el criterio de aceptación de la Prioridad 1 del diagnóstico: comprobarlo
«con la vista previa de etiquetas de Google, no leyendo el código».

### Lo que sí se puede afirmar, y es buena noticia

**El paso manual de importar los eventos de GA4 a Ads está hecho.** Las dos
acciones `clic_whatsapp` y `clic_telefono` figuran con fuente «Website (Google
Analytics GA4)». Era un paso fuera de este repositorio, anotado en el Paso 1 de
`despliegue-corte-dominio.md`, y el más fácil de dar por hecho sin que nadie lo
hiciera. Está hecho.

---

## Lo que queda por hacer, en orden

1. **Verificar los tres eventos con Tag Assistant** sobre `mipc.com.co`. Sin
   esto, lanzar es pagar por clics que no se sabe medir.
   - `clic_whatsapp` — pulsar el botón flotante
   - `clic_telefono` — pulsar el teléfono de la cabecera
   - conversión de formulario — enviar el formulario y llegar a `/gracias/`.
     **Ojo: un envío de prueba llega al buzón real.** Identificarlo como prueba
     en el mensaje.
2. **Leer el detalle de la acción de conversión mejorada con «urgent issues»**,
   que hoy no se pudo ver.
3. **Lanzar la campaña.** La anomalía que lo bloqueaba está cerrada y la ventana
   se está consumiendo sola.

## Lo que sigue sin saberse

- **Qué problema concreto tiene la acción de conversión mejorada.**
- **Si las etiquetas disparan de verdad**, que es el punto 1 de arriba.
- Las dos tasas que gobiernan la rentabilidad —clic→contacto y contacto→taller—
  siguen siendo estimaciones sin un dato detrás, y lo seguirán siendo hasta que
  la campaña corra. Es el motivo por el que la campaña existe.
