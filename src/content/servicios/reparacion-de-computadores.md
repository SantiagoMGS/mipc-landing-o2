---
titulo: Reparación de Computadores
h1: Reparación de computadores en Medellín
metaTitle: Reparación de Computadores en Medellín | MiPC Tecnología
metaDescription: "Reparación de computadores en Medellín: recogemos tu equipo gratis y el diagnóstico no te cuesta nada si autorizas la reparación. Garantía de 30 días."
resumen: Recogemos tu equipo gratis y te lo devolvemos reparado. El diagnóstico no te cuesta nada si autorizas la reparación. Cualquier marca, incluido Apple.
publico: ambos
orden: 2
# Quien contacta desde esta página es, la mayoría de las veces, un particular
# con un equipo dañado — no alguien «interesado en un servicio». El genérico
# de la plantilla sonaba a catálogo; este suena a la razón real de escribir.
mensajeWhatsApp: Hola, tengo un computador dañado y quiero cotizar la reparación
# El precio SIGUE siendo 25000 y no se toca: es lo que cuesta el diagnóstico
# para quien no autoriza la reparación, que es el único caso en que se cobra.
# Lo que cambió el 2026-08-16 fue cómo se cuenta, no cuánto vale — ver el
# comentario de `beneficios` justo debajo.
oferta:
  nombre: Diagnóstico
  precio: 25000
  descripcion: Sin costo si se autoriza la reparación; $25.000 si no se autoriza
# El orden de estas dos líneas es la decisión, y conviene que quede escrita.
# Antes la primera decía «Diagnóstico por $25.000, abonables a la reparación»:
# cierto, pero en un titular «$25.000» se lee peor que el «gratis» que anuncia
# la competencia, aunque para quien repara el resultado sea idéntico. Ahora se
# cuenta empezando por el caso mayoritario —quien autoriza no paga diagnóstico—
# y la línea siguiente dice el precio del otro caso, sin letra pequeña.
#
# NO es una rebaja encubierta ni un «gratis» con asterisco: el número sigue
# visible en la página, en las FAQ y en el schema. Es el mismo trato contado
# desde el lado que le toca a la mayoría.
beneficios:
  - Recogemos y devolvemos tu equipo gratis, máximo un día hábil
  - Diagnóstico sin costo si autorizas la reparación
  - Si decides no repararlo, pagas $25.000 y te llevas el informe
  - Garantía de 30 días sobre la mano de obra
  - "Cualquier marca: HP, Lenovo, Dell, Asus, Acer, Apple y ensamblados"
  - Cambio de pantallas y discos duros
  - Eliminación de virus y reinstalación de sistema operativo
  - Rescate de información
  - Mantenimiento preventivo por contrato para empresas
faq:
  - pregunta: ¿Recogen el computador en mi casa?
    respuesta: Sí, y la recogida es gratis. Pasamos por el equipo en Medellín, Envigado, Sabaneta, Itagüí, Bello y La Estrella, y te lo devolvemos reparado en la misma dirección. Máximo un día hábil desde que nos escribes hasta que el equipo está en el taller.
  - pregunta: ¿Reparan en mi casa o se llevan el equipo?
    respuesta: "Nos lo llevamos al taller. Un cambio de pantalla, una soldadura o el rescate de un disco necesitan banco de trabajo y herramienta que no caben en un maletín, y hacerlos sobre la mesa del comedor es peor trabajo. Por eso la recogida es gratis: para que llevarlo al taller no te cueste nada."
  - pregunta: ¿Cuánto cuesta reparar un computador en Medellín?
    respuesta: "Si autorizas la reparación, el diagnóstico no te cuesta nada: los $25.000 que vale se abonan al total. Si decides no repararlo, pagas solo esos $25.000 y te llevas el equipo con el informe. La reparación en sí depende de qué encuentre el diagnóstico y se cotiza antes de hacer nada: no hay trabajo sin cotización aprobada."
  - pregunta: ¿Cuánto se demora el diagnóstico?
    respuesta: Un día hábil desde que el equipo llega al taller. El tiempo de la reparación depende de si hay que conseguir repuesto, y eso te lo decimos con la cotización, no después.
  - pregunta: ¿Y si al final no quiero repararlo?
    # Entrecomillada por el «gratis: no». Un `: ` dentro de un escalar suelto
    # rompe el análisis de YAML, y el build falla con un error de js-yaml que
    # no menciona ni el campo ni el archivo de contenido, solo línea y columna.
    respuesta: "Pagas los $25.000 del diagnóstico y te devolvemos el equipo con un informe de qué tiene. La recogida y la entrega siguen siendo gratis: no están condicionadas a que autorices la reparación."
  - pregunta: ¿Reparan Mac?
    respuesta: Sí. Atendemos cualquier marca, incluidos los equipos Apple — MacBook Air, MacBook Pro e iMac.
  - pregunta: ¿Reparan portátiles HP, Lenovo, Dell, Asus o Acer?
    respuesta: Sí, y cualquier otra marca. Trabajamos con HP, Lenovo, Dell, Asus, Acer, Toshiba, Samsung, MSI, Huawei, Apple y equipos ensamblados. No hay lista cerrada de fabricantes ni derivamos a servicios autorizados.
  - pregunta: ¿Puedo recuperar la información de un disco dañado?
    respuesta: En la mayoría de los casos sí. El diagnóstico determina si la falla es lógica o física y qué porcentaje de la información es recuperable.
  - pregunta: ¿Qué garantía tiene la reparación?
    respuesta: La mano de obra de los servicios de reparación, instalación y configuración tiene garantía de 30 días. Las condiciones completas están publicadas en la página de políticas y garantías.
  - pregunta: ¿Dónde queda el taller?
    # Entrecomillada por DOS motivos, y el primero es el peligroso. En YAML un
    # ` #` precedido de espacio abre un comentario: sin comillas, la dirección
    # «Carrera 66A # 34-48» se habría publicado truncada en «Carrera 66A», sin
    # error y sin que nada lo notara. El segundo motivo es el «falta: la» del
    # final, que es el mismo caso que la respuesta de arriba.
    respuesta: "En Laureles, Carrera 66A # 34-48, Interior 101, a pocas cuadras del Estadio. Puedes traer el equipo si te queda de paso, pero no hace falta: la recogida no tiene costo."
---

Reparamos computadores de escritorio, portátiles y todo en uno: pantallas
rotas, discos que fallan, equipos lentos, infecciones por virus, sistemas
operativos que no arrancan y rescate de información. **Cualquier marca,
incluidos los equipos Apple.**

## Recogemos tu equipo gratis

No tienes que traerlo. Pasamos por él **sin costo** en Medellín, Envigado,
Sabaneta, Itagüí, Bello y La Estrella, y te lo devolvemos reparado en la misma
dirección. **Máximo un día hábil** desde que nos escribes hasta que el equipo
está en el taller.

La recogida no está condicionada a que autorices la reparación. Si el
diagnóstico no te convence, te devolvemos el equipo con el informe y no pagas
transporte por ninguno de los dos viajes.

**La reparación se hace en el taller, no en tu sala.** Conviene decirlo claro
porque buena parte de la competencia ofrece justo lo contrario. Un cambio de
pantalla, una soldadura o el rescate de un disco necesitan banco de trabajo,
herramienta e instrumentos que no caben en un maletín; hacerlos sobre la mesa
del comedor con el equipo apoyado en un mantel es peor trabajo, aunque suene
más cómodo. La recogida gratis existe precisamente para que eso no te cueste
ni el desplazamiento ni el tiempo.

## Cuánto cuesta y cómo funciona

**Si reparas, el diagnóstico no te cuesta nada.** Vale $25.000 y toma un día
hábil, pero esos $25.000 se abonan al total en cuanto autorizas la reparación.
Solo se cobran en un caso: si después de saber qué tiene el equipo decides no
arreglarlo. Entonces pagas esos $25.000 y te llevas el computador con el
informe. Nunca se ejecuta un trabajo sin cotización aprobada.

Decimos la cifra en vez de escribir «diagnóstico gratis» y nada más, porque el
gratis a secas casi nunca lo es: o va dentro del precio de la reparación, o
reaparece al final como «revisión». Quien tiene el portátil dañado abre tres
pestañas, encuentra «consulta sin compromiso» en las tres, y termina llamando
para preguntar lo mismo que podría haber leído. La ambigüedad no protege el
margen: solo hace perder una tarde a las dos partes.

En orden, el proceso completo es este:

1. Nos escribes por WhatsApp y cuentas qué le pasa al equipo.
2. Lo recogemos donde estés, gratis, en un día hábil o menos.
3. Diagnóstico en un día hábil. Te decimos qué tiene y cuánto cuesta arreglarlo.
4. Autorizas o no. Si autorizas, los $25.000 se descuentan del total.
5. Te lo devolvemos en tu dirección, con la mano de obra garantizada 30 días.

## Qué arreglamos, falla por falla

### El computador está lento

Casi nunca es que «ya esté viejo». Un equipo que tarda tres minutos en
encender suele tener el disco al límite, demasiados programas arrancando
solos, o un disco mecánico donde debería haber un SSD. El diagnóstico
distingue cuál de las tres es antes de recomendarte gastar en repuestos: hay
casos que se resuelven con una limpieza de arranque y otros en los que cambiar
el disco convierte un equipo lento en uno perfectamente usable por años.

### La pantalla está rota o no da imagen

Cambiamos pantallas de portátil y de todo en uno. Un golpe, una bisagra que
cedió o un cable interno suelto dan síntomas parecidos —imagen partida,
manchas que crecen, pantalla negra con el equipo encendido— y no cuestan lo
mismo de arreglar. Por eso el diagnóstico va antes que la cotización: no se
pide un repuesto hasta saber que el repuesto es el problema.

### El sistema operativo no arranca

Pantallas azules, arranques en bucle, mensajes de disco no encontrado. Puede
ser el sistema o puede ser el disco que lo contiene, y la diferencia importa
mucho: en un caso se reinstala, en el otro hay que rescatar la información
primero. **Nunca formateamos sin haber comprobado antes qué se puede salvar.**

### Virus e infecciones

Publicidad que aparece sola, el navegador que cambia de página de inicio, el
equipo que se arrastra sin que haya nada abierto. Limpiamos la infección y, si
el sistema quedó dañado, lo reinstalamos dejando tus archivos aparte.

### El disco duro falla

Ruidos, archivos que desaparecen, carpetas que no abren. El disco es la única
pieza del computador cuya falla te puede costar algo que no se compra de
nuevo: las fotos, los documentos, la contabilidad. Si sospechas del disco,
**deja de usar el equipo y escríbenos** — cada encendido adicional reduce lo
que se puede recuperar.

### Rescate de información

En la mayoría de los casos se recupera. El diagnóstico determina si la falla
es lógica —el disco está bien pero el sistema de archivos no— o física, y qué
porcentaje de la información es recuperable. Te lo decimos antes de cobrar
nada por el rescate, no después.

## Qué marcas reparamos

**Todas.** Trabajamos con cualquier marca de computador de escritorio, portátil
y todo en uno, y no derivamos a nadie a un servicio autorizado por el logotipo
que traiga el equipo.

En la práctica, las que más entran al taller son estas:

- **HP** — portátiles, todo en uno y equipos de escritorio
- **Lenovo** — incluidas las líneas ThinkPad e IdeaPad
- **Dell** — Inspiron, Vostro, Latitude
- **Asus** y **Acer** — portátiles de consumo y equipos para juegos
- **Apple** — MacBook Air, MacBook Pro e iMac
- **Toshiba**, **Samsung**, **MSI** y **Huawei**
- **Equipos ensamblados**, que en un escritorio son la mitad de lo que llega

Que la lista no sea cerrada importa más de lo que parece. Un portátil de marca
poco común, uno descontinuado o uno ensamblado por pieza suele ser justo el que
nadie quiere recibir, y es donde el cliente termina oyendo «eso ya no tiene
arreglo» cuando lo que pasa es que conseguir el repuesto da trabajo. Acá el
diagnóstico se hace igual y, si el repuesto existe, se consigue; si de verdad no
existe, te lo decimos con el informe en la mano y no después de tenerte el
equipo tres semanas.

## Cuánto tarda

| Etapa | Tiempo |
|---|---|
| Recogida en tu dirección | Máximo un día hábil |
| Diagnóstico | Un día hábil desde que llega al taller |
| Reparación | Depende del repuesto — se te dice con la cotización |

Ese último punto es el único que no podemos fijar de antemano, y preferimos
decirlo así en lugar de prometer un plazo que dependa de si un distribuidor
tiene la pieza. Lo que sí garantizamos es que el plazo lo sabrás **con la
cotización**, antes de autorizar nada, y no a mitad del trabajo.

## Garantía de 30 días

La mano de obra de los servicios de reparación, instalación y configuración
queda con **garantía de 30 días**. No es una frase suelta: las condiciones
completas, con lo que cubre y lo que no, están publicadas en
[políticas y garantías](/garantias/).

## Zonas que atendemos

El taller está en **Laureles**, en la Carrera 66A # 34-48, a pocas cuadras del
Estadio. Desde ahí atendemos Laureles, Estadio, Conquistadores, Suramericana,
La Floresta, Bolivariana, Belén y el resto de Medellín.

Con recogida gratis llegamos además a **Envigado, Sabaneta, Itagüí, Bello y La
Estrella**. Puedes traer el equipo al taller si te queda de paso, pero no hace
falta.

## Para empresas

Para empresas ofrecemos mantenimiento preventivo programado, que es lo que
evita que un equipo crítico falle en el peor momento — y se ejecuta en sitio,
por lotes, para no dejar puestos de trabajo parados. Es el mismo taller y el
mismo equipo técnico, con la diferencia de que se trabaja por contrato y con
un calendario, no por avería.
