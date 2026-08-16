# ¿Es acertado priorizar reparación de computadores?

Escrito el **2026-08-16**, a petición de Santiago, después de que planteara
optimizar el sitio para *reparación de computadores a particulares* con este
razonamiento: **hay empleados quietos y hace falta una victoria temprana**.

Esto es una **opinión de negocio**, no una medición. Se apoya en datos que sí
están medidos —los de `docs/auditoria-reparacion-medellin.md`— pero la
recomendación es un juicio, y se marca como tal. Tres números del negocio que
la decidirían no los tengo; están al final.

---

## Respuesta corta

> **El instinto es correcto. El canal probablemente no es el más rápido.**
>
> Llenar capacidad ociosa con trabajo de ciclo corto está bien pensado. Pero
> reparación a particulares por búsqueda es de las jugadas más lentas y más
> caras que hay disponibles, y hay una que empieza mañana y cuesta cero.

---

## Dónde el razonamiento es correcto

Con nómina parada lo que importa es el **ciclo de decisión**, no el tamaño del
ticket. Un particular con el portátil dañado decide hoy; una empresa pide
cotización, la revisa con su jefe y responde en semanas. Si el problema es que
esta quincena hay técnicos sin qué hacer, una venta B2B que se cierra en marzo
no la resuelve.

Ese razonamiento es sólido y no hay que descartarlo. Lo que sigue no lo
contradice: lo redirige.

---

## Tres razones por las que no es la victoria más temprana

### 1. Se compite en desventaja estructural

**Medido** (§5 de la auditoría): los cuatro competidores leídos construyen su
mensaje sobre **domicilio**, y varios ofrecen **diagnóstico gratis**. MiPC cobra
**$25.000 abonables** y requiere que el equipo llegue al taller.

El modelo de MiPC es mejor técnicamente —una reparación de hardware en la mesa
del comedor del cliente es peor trabajo, y decirlo es un argumento de venta—
pero en una subasta de Google se paga **el mismo clic** con una oferta que en el
titular se lee peor. *Estimado:* mayor costo por cliente potencial y menor tasa
de cierre que los competidores, para la misma inversión.

Es una pelea de **posicionamiento**, no de volumen. Se puede ganar, pero no es
barata ni rápida.

### 2. El contenido son tres o cuatro semanas

**Medido** (§6): la página de reparación tiene **~430 palabras de cuerpo** contra
**~2.900** del competidor más fuerte y **~1.100** del más flaco. Llegar a
1.200–1.500 palabras con la estructura de encabezados que hace falta es trabajo
de un mes.

Eso no es una victoria temprana.

### 3. Es el trabajo de menor valor que saben hacer los técnicos

Los doce proyectos documentados son infraestructura B2B: 19 enlaces Cat6 en
tiendas TOUS, puntos de información en Oviedo con obra eléctrica, racks con
firewall, CCTV, canalización. Poner a esa gente a cambiar discos de portátiles
particulares es asignar capacidad cara al ticket más barato del mercado.

---

## Lo que haría primero, y cuesta cero

### La base instalada

**+70 empresas atendidas desde 2009.** Hoy no se está usando.

Una ronda de WhatsApp y llamadas a esos 70 contactos —mantenimiento preventivo,
revisión de equipos, «llevamos dos años sin pasar por allá»— **no cuesta nada,
empieza mañana y convierte muchísimo mejor que un clic frío**, porque ya
conocen a MiPC y ya le compraron.

Es trabajo B2B, pero de **ciclo corto**, que es justo lo que se buscaba.

### El puente: mantenimiento de flotas

Mantenimiento de parques de equipos en empresas usa **los mismos técnicos y el
mismo taller**, con tickets de 10–30 máquinas en vez de una, y ahí la prueba
social de MiPC sí funciona. En reparación a particulares, los proyectos de TOUS
y Oviedo no le dicen nada a nadie.

---

## Corrección al plan que sí ayuda: Ads no espera al contenido

La auditoría mezcla dos cosas que van por separado:

| | Para qué sirve | Cuánto tarda |
|---|---|---|
| Reescribir a 1.200–1.500 palabras | **Posicionamiento orgánico** | 3–4 semanas |
| Lanzar Google Ads | **Tráfico pagado** | días |

Google Ads puntúa **relevancia y experiencia de la página de destino**, no
longitud. La página de reparación actual, con el precio visible, la garantía de
30 días y un WhatsApp que diga lo correcto, puede convertir bien tal como está.

**Conclusión práctica:** si se quiere probar reparación con pauta, se puede
arrancar en días con presupuesto pequeño, en paralelo al trabajo de contenido.
No hay que esperar el mes.

Prerrequisitos que sí bloquean (ver `docs/despliegue-corte-dominio.md`):

1. Prefill del WhatsApp flotante corregido — hoy le pone «para mi empresa» en la
   boca a un particular
2. `clic_whatsapp` y `clic_telefono` marcados como eventos clave e importados a
   Ads — con una campaña de reparación, la conversión principal **no** es el
   formulario
3. Decisión sobre el banner de cookies
4. Tarjeta permanente en la cuenta de Ads

---

## Los tres números que faltan para opinar de verdad

Sin esto, cualquier recomendación sobre rentabilidad es adivinanza:

1. **Ticket promedio de una reparación cerrada**, sin contar el diagnóstico.
2. **Tasa de autorización:** de cada 10 equipos que entran a diagnóstico,
   ¿cuántos autorizan la reparación?
3. **Capacidad ociosa real:** ¿un técnico media jornada, o tres a tiempo
   completo? No es lo mismo llenar 20 horas al mes que 500.

Con esos tres se puede calcular si el costo por cliente cabe en el margen, o si
se lo come.

---

## Recomendación

1. **Esta semana:** ronda a los 70 clientes de la base instalada. Cero costo,
   cero dependencia técnica, empieza mañana.
2. **En paralelo:** campaña de reparación con presupuesto pequeño, en cuanto
   estén los cuatro prerrequisitos. Como **prueba medida**, no como apuesta.
3. **A cuatro semanas:** el trabajo de contenido de la auditoría, que es lo que
   baja el costo por clic y sostiene el orgánico.
4. **Reevaluar con datos** cuando haya 30–50 clics pagados y se pueda ver el
   costo real por cliente potencial.

Lo primero puede llenar la agenda antes de que se apruebe el primer anuncio.
