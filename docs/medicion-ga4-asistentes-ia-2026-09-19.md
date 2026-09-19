# Asistentes de IA en GA4 — primera medición

> **CORRECCIÓN (2026-09-19, mismo día).** Más abajo este documento llama al
> tráfico directo «una carga automática, no visitantes». **Es falso y manda
> esta corrección.** Al mirar la hora del día aparece el patrón contrario:
> 2 sesiones a las 2 a.m. y 198 a las 8 a.m., con pico entre las 7 y las 9 y
> caída sostenida durante la tarde. Un proceso automático no duerme de
> madrugada. Son **personas reales encendiendo el computador**, que es
> justamente lo que predice la práctica de dejar el sitio como página de
> inicio del navegador al formatear un equipo.
>
> Lo que sí se sostiene del cuerpo: esas sesiones duran 2,3 segundos, el 90%
> entra por `/` y no representan a nadie que haya decidido visitar el sitio.
> Siguen falseando cualquier promedio global y siguen habiendo que excluirse.
> Lo que cambia es **qué son**: no ruido de máquina, sino impresiones de marca
> forzadas. Ver `docs/pagina-de-inicio-en-equipos-de-clientes.md`.

**Fecha:** 2026-09-19
**Periodo:** 2026-08-16 (corte de dominio) → 2026-09-19
**Método:** API de datos de GA4, propiedad `550105266`, vía `scripts/ga4.mjs`.
Reproducible: `node scripts/ga4.mjs asistentes`.

## Por qué se midió

El 2026-09-19 entró una clienta que contó que llegó porque le describió a
ChatGPT su necesidad de redes y cámaras y el asistente le nombró a MiPC. La
pregunta era si eso era una anécdota o un canal.

## Lo que hay

```
FUENTE / MEDIO              SESIONES  USUARIOS  CONV.
chatgpt.com / ai-assistant         8         7      2
```

Es un canal, no una anécdota: ocho sesiones repartidas en seis días distintos
entre el 24 de agosto y el 15 de septiembre, no un pico. GA4 ya lo clasifica en
su propio medio, `ai-assistant`.

Ningún otro asistente aparece. Ni Perplexity, ni Claude, ni Gemini, ni Copilot.

## El dato que cambia cómo se lee todo lo demás

Comparación de calidad por fuente, mismo periodo:

| Fuente | Sesiones | Con interacción | Segundos/sesión | Págs./sesión |
|---|---|---|---|---|
| **(direct)** | **1.618** | **25%** | **2,3** | **1,35** |
| google | 61 | 46% | 53,4 | 1,67 |
| **chatgpt.com** | **8** | **63%** | **11,3** | **1,75** |
| facebook.com | 4 | 50% | 2,3 | 1,00 |
| ficha-google | 3 | 67% | 23,7 | 2,33 |

**El tráfico directo no es tráfico.** 1.618 sesiones de 250 usuarios —6,5
sesiones por usuario— con una media de **2,3 segundos** y 1,35 páginas. Eso no
es nadie leyendo: es una carga automática. Son el 94% de todas las sesiones de
la propiedad, y mientras estén ahí **cualquier promedio del sitio es falso**.

La hipótesis más probable, y encaja con el perfil: equipos de clientes con el
sitio puesto como página de inicio del navegador. `CLAUDE.md` documenta que eso
se hizo durante años al formatear, con `mipctecnologia.com`. Cada apertura de
navegador sería una sesión de dos segundos que nadie pidió.

No está confirmado. Confirmarlo o descartarlo es trabajo aparte, y hasta
entonces **no se debe citar ninguna cifra global de GA4** —ni sesiones, ni tasa
de conversión del sitio— sin excluir el directo.

Con ese filtro puesto, **ChatGPT es la fuente con mejor tasa de interacción de
todas: 63%**, por encima del orgánico de Google (46%).

## Cómo convierte este canal

```
EVENTO         VECES
clic_telefono      1
clic_whatsapp      1
```

**Ninguna conversión por formulario.** Las dos fueron clic a teléfono y clic a
WhatsApp.

Esto importa más de lo que parece. Ese mismo día se amplió `Atribucion.astro`
para que el correo del formulario dijera de dónde viene el contacto —ver el
commit «Hace visible el canal de los asistentes de IA»—. Es correcto y sigue
haciendo falta, pero **no captura este canal**: quien llega por ChatGPT no
rellena el formulario, llama o escribe por WhatsApp. En una llamada no viaja
ninguna atribución.

O sea que el canal se ve **en agregado** (GA4 lo cuenta) pero **no por
contacto** (no se sabe cuál de las llamadas de la semana vino de ahí). Para
ocho sesiones al mes, el agregado basta. La pregunta «¿cómo nos encontró?»
sigue siendo la única forma de cerrar el vínculo con una venta concreta.

## Por dónde entran

| Página de entrada | Sesiones |
|---|---|
| `/` | 3 |
| `/nosotros` | 2 |
| `/servicios/reparacion-de-computadores` | 2 |

**`/nosotros` como segunda página de entrada es lo más interesante del cuadro.**
No es una página de servicio ni de conversión: es la que dice quién es la
empresa. Que un asistente la cite sugiere que lo que está usando para
recomendar no es solo el catálogo, es la identidad verificable —años, NIT,
dirección, obra—. Es un argumento a favor de reforzar esa página, no de
llenarla de palabras clave.

## De dónde viene la gente, y el problema que eso plantea

| Ciudad | Sesiones |
|---|---|
| Bogotá | 4 |
| Medellín | 3 |
| Bucaramanga | 1 |
| Montería | 1 |
| Noida (India) | 1 |

*(La suma da 10 sobre 8 sesiones. GA4 reparte así algunas filas de ciudad; la
cifra fiable es el total de 8, no el desglose.)*

**Aproximadamente la mitad de este tráfico está fuera del área de servicio.** Un
asistente no aplica la geografía con el rigor de un paquete local: recomienda
por lo que sabe de la empresa, no por dónde está el usuario. Bogotá encabeza la
lista de una empresa que trabaja en el Valle de Aburrá.

Consecuencia práctica: **este canal traerá consultas que no se pueden atender**,
y eso no es un fallo del canal. Conviene que la web diga con claridad dónde se
trabaja —es lo que hace `/rionegro/` y lo que hace el bloque de cobertura de
`/contacto/`—, porque esa claridad la leen también los asistentes.

## Lo que NO se puede concluir

- **Que el canal «convierte al 25%».** Dos eventos clave sobre ocho sesiones no
  es una tasa de cierre: un clic a WhatsApp es una intención, no una venta.
  Con ocho sesiones, un solo clic mueve la cifra doce puntos.
- **Que ChatGPT sea mejor que el orgánico.** Tiene mejor interacción en una
  muestra de ocho. El orgánico trae siete veces más sesiones.
- **Que esto sea todo el efecto.** Es el **suelo**. Solo cuenta a quien llegó
  por un enlace con `utm_source=chatgpt.com`. Cuando el asistente nombra la
  empresa sin enlazar y la persona escribe el dominio o la busca, la visita
  entra como directa y es indistinguible. Esa es probablemente la forma más
  fuerte de la recomendación y es estructuralmente invisible.

## Qué haría falta para verlo mejor

1. **Limpiar el tráfico directo.** Hasta que se sepa qué son esas 1.618
   sesiones, la propiedad no sirve para medir nada global.
2. **Seguir preguntando «¿cómo nos encontró?»** y anotarlo. Es el único puente
   entre este canal y una venta.
3. **Bing Webmaster Tools.** ChatGPT se apoya en el índice de Bing y nunca se ha
   mirado. Queda pendiente.

## Acceso, para quien lo repita

Tres permisos distintos, ninguno implica a los otros:

1. API de datos de GA4 habilitada en el proyecto `coral-sanctuary-505815-r2`.
2. API de administración de GA4 habilitada (solo para `ga4.mjs propiedades`).
3. `lector-search-console@coral-sanctuary-505815-r2.iam.gserviceaccount.com`
   dado de alta como **Lector** en GA4 → Administrar → Accesos a la propiedad.

Los tres fallan con `403` y el mensaje no siempre dice cuál falta. Empezar
siempre por `node scripts/ga4.mjs propiedades`.
