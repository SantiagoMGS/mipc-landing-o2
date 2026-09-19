# La página de inicio en los equipos de clientes: ¿sirve?

**Fecha:** 2026-09-19
**Método:** API de datos de GA4, propiedad `550105266`, 2026-08-16 → 2026-09-19.
Reproducible con `scripts/ga4.mjs`.

## La práctica

Al formatear o reparar un equipo, MiPC deja su sitio como página de inicio del
navegador. Se ha hecho durante años, con `mipctecnologia.com` primero y con
`mipc.com.co` después.

## Que funciona, funciona

El patrón horario no deja duda de que son personas:

| Hora (Bogotá) | Sesiones |
|---|---|
| 2 a.m. | 2 |
| 3 a.m. | 6 |
| **7 a.m.** | **175** |
| **8 a.m.** | **198** |
| **9 a.m.** | **157** |
| 11 a.m. | 95 |
| 3 p.m. | 105 |
| 10 p.m. | 35 |

Pico al empezar la jornada, segunda cresta después del almuerzo, nada de
madrugada. Es el horario de oficina de Colombia dibujado en una gráfica.

**1.618 sesiones de unos 250 equipos en 35 días.** El 90% entra por `/`.
Ochenta usuarios recurrentes generan 613 sesiones: 7,7 cada uno.

Como mecanismo de repetición de marca, es de una eficacia que ningún canal
pagado alcanza: **alrededor de 250 personas ven el nombre de MiPC casi todos
los días laborales, gratis, durante años.**

## Y ahí se acaba lo bueno

**Duran 2,3 segundos y ven 1,35 páginas.** El 25% registra alguna interacción.
Nadie está leyendo: están quitándose la página de encima para ir a donde iban.

Eso no es un fallo de la página. Es lo que hace cualquiera con una página de
inicio que no eligió. La comparación honesta:

| Fuente | Segundos/sesión | Con interacción |
|---|---|---|
| directo (mayoría, página de inicio) | 2,3 | 25% |
| google / organic | 53,4 | 46% |
| chatgpt.com | 11,3 | 63% |

Una sesión de orgánico vale, en atención, lo que veintitrés de estas.

## ¿Trae contactos?

El tráfico directo produjo **19 eventos clave en 35 días**: 9 clics a WhatsApp,
7 a teléfono y 3 envíos de formulario. En números absolutos es más que
cualquier otro canal —el orgánico dio 12—.

**Pero no se puede atribuir eso a la página de inicio.** «Directo» es un cajón
de sastre: incluye a quien escribe `mipc.com.co` porque ya conoce la marca, a
quien tiene un marcador, y a quien llega desde WhatsApp, Instagram o un correo,
porque esas aplicaciones borran el referente. Con los datos de hoy **no hay
forma de separar las dos cosas**, y eso es exactamente el problema.

## El costo real, que no es el que parece

No es molestar al cliente. Es este:

**La práctica destruye la capacidad de medir el negocio.** El 94% de las
sesiones de la propiedad son esto. Mientras estén mezcladas, ninguna cifra
global de GA4 significa nada: ni la tasa de conversión del sitio, ni el tiempo
medio, ni el efecto de una campaña. Se paga en decisiones tomadas a ciegas.

Hay tres costos menores, pero reales:

1. **Hoy está rota.** Los equipos configurados con `mipctecnologia.com` reciben
   un `302` a un dominio inexistente: cada mañana ven una pantalla de error con
   la marca de MiPC encima. No es una impresión de marca, es la contraria.
   Ver `CLAUDE.md`, «Vivo y roto ahora mismo».
2. **Marcadores muertos.** 23 sesiones entraron por `/shop`, que es del
   WordPress viejo y hoy responde 404. Nadie lo había visto.
3. **Cambiar la página de inicio sin pedirlo es lo que hace el software
   malicioso.** La mayoría de los clientes no dirá nada; algunos la cambiarán,
   y alguno lo contará mal.

## Veredicto

**Como recordatorio de marca, sí sirve. Como canal, no es un canal, y tratarlo
como tal es lo que sale caro.**

No hay que quitarlo. Hay que dejar de pagarle el precio de la medición y
empezar a cobrarle lo que puede dar.

## Qué hacer, en orden

**1. Etiquetar la página de inicio.** Configurar en adelante:

```
https://mipc.com.co/?utm_source=equipo-cliente&utm_medium=inicio-navegador
```

Cuesta lo mismo escribirlo. A cambio:
- Deja de contaminar el directo, y las cifras globales vuelven a servir.
- Por primera vez se puede responder si esos 250 equipos producen contactos.
- `Atribucion.astro` ya guarda los `utm_*`, así que un formulario enviado desde
  ahí llegaría al correo diciendo `source: equipo-cliente`. Sin tocar código.

**2. Usar esa audiencia para lo que de verdad hace falta: reseñas.** Son ~250
clientes que ya pagaron y que ven la marca a diario, y la ficha de Google sigue
en **cero reseñas**. Veinte reseñas de esa gente valdrían más —para el paquete
local y para que un asistente de IA recomiende a MiPC— que otro año de cargas
de dos segundos. Es la misma audiencia y está sin pedir.

**3. Arreglar `/shop`**, y revisar si hay más marcadores del WordPress viejo
cayendo en 404.

**4. Decidir qué ve el cliente al abrir el navegador.** Si va a estar ahí, que
al menos tenga un motivo para quedarse dos segundos más: un teléfono grande,
el estado de una reparación, algo útil. Hoy es la portada comercial, que está
escrita para convencer a un desconocido, no para servirle a un cliente.

## Lo que NO hay que concluir

- **Que las 19 conversiones del directo vienen de aquí.** No se sabe, y hasta
  el punto 1 no se sabrá.
- **Que esto ayuda al posicionamiento.** No. Google no usa los datos de
  Analytics para ordenar resultados, y el tráfico directo no mejora rankings.
  Lo único que mueve es el recuerdo de marca.
