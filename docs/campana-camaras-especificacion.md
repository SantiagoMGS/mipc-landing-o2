# Campaña de cámaras de seguridad: especificación para montar

**Escrita el 2026-09-23**, después de cerrar que la campaña de reparación no
puede lanzarse (ver `ads-anuncio-rechazado-2026-09-19.md`).

## Lee esto antes de montarla

Esta campaña **no va a traer volumen**, y montarla esperando volumen es
montarla para decepcionarse. El planificador ya lo midió el 2026-09-19:

| Término | Volumen/mes en Medellín | Intención |
|---|---|---|
| `camaras de seguridad` | **1K – 10K** | comprar un aparato |
| `instalacion de camaras de seguridad` | **10 – 100** | contratar a alguien |

`planificador-otros-servicios-2026-09-19.md` lo llamó por su nombre: **el
volumen alto de cámaras es una trampa, no una oportunidad.** Las diez ideas
más buscadas son `camara espia`, `camaras wifi`, `camara ezviz`, `camaras para
casa` —marcas y productos—. Sus pujas arrancan en 64–197 COP, que es precio de
comercio electrónico. El término que sí es de contratación pide 2.142–6.591:
veinte veces más caro, con una centésima parte del volumen.

Ese mismo documento concluyó que **ninguna de las cuatro líneas B2B justifica
una campaña propia todavía**. Esa conclusión sigue en pie. Lo que cambió es
que la línea que sí la justificaba —reparación— resultó imposible de anunciar.

**Entonces, ¿para qué montarla?** Por tres razones honestas:

1. **Para aprender si la intención B2B convierte**, a un costo acotado. Nunca
   se ha probado.
2. Porque el gasto está **limitado por el volumen, no por el presupuesto**: no
   hay forma de que se gaste mucho aunque se quiera.
3. Porque la página de destino está lista y es buena —947 palabras, 5 FAQ,
   `Service` en JSON-LD, obra real detrás—, y no cuesta nada aprovecharla.

**Lo que NO es:** un plan para llenar la agenda de instalaciones.

## El riesgo que de verdad importa: otra política encima

Acabamos de perder la campaña de reparación por una categoría de política que
nadie miró antes de montarla. Cámaras tiene la suya, y es peor de ignorar.

**Google prohíbe la publicidad de vigilancia encubierta**: productos o
servicios para rastrear o monitorear a una persona sin su consentimiento
—cámaras espía, rastreadores, software de monitoreo—. No es una categoría
certificable: es una prohibición.

MiPC no hace nada de eso: instala CCTV en empresas, con señalización y bajo
contrato. **Pero el riesgo no está en lo que MiPC hace, está en para qué
consulta se muestre el anuncio.** Y las palabras de mayor volumen del sector
son justamente `camara espia` y `mini camara espia`.

De ahí sale la regla que gobierna esta especificación:

> **Ninguna concordancia amplia. Nunca. Las negativas de producto y de espía
> no son una optimización de presupuesto: son la protección contra un segundo
> rechazo.**

## Configuración

| | |
|---|---|
| Tipo | Búsqueda, solo red de búsqueda (**sin socios, sin display**) |
| Objetivo | Clientes potenciales |
| Puja | **CPC manual mejorado**, tope **5.000 COP** |
| Presupuesto | **10.000 COP/día** |
| Ubicaciones | Medellín, Envigado, Sabaneta, Itagüí, Bello, La Estrella |
| Presencia | **«Personas que están o visitan regularmente»** — NO «interés» |
| Idioma | Español |
| Página de destino | `https://mipc.com.co/servicios/camaras-de-seguridad/` |

**Por qué CPC manual con tope y no «maximizar clics».** Con pujas de 2.142 a
6.591, «maximizar clics» pagará el techo por los clics marginales, que en un
mercado tan pequeño son casi todos. El tope de 5.000 renuncia a la posición
más cara a cambio de no pagarla. Es preferible aparecer menos que aparecer
caro cuando no se sabe todavía si convierte.

**Por qué el presupuesto casi no importa.** Con 10–100 búsquedas al mes del
término de contratación, no hay manera de gastar 10.000 COP diarios. Se pone
ese número para no tropezar con el límite en un día bueno, no porque se espere
gastarlo. **Presupuestar 300.000 COP al mes y gastar 40.000 es el resultado
normal aquí, no un fallo.**

**Por qué «están o visitan» y no «interés».** Es el error que ya se cometió
una vez con Colombia entera en la campaña anterior. Alguien en Bogotá
interesado en Medellín no va a contratar una instalación en Medellín.

## Grupo de anuncios único: «Cámaras – instalación empresas»

Uno solo. Con este volumen, repartirlo en varios grupos deja a todos sin datos
suficientes para decidir nada.

### Palabras clave

Todas en **concordancia de frase o exacta**. Ninguna amplia.

```
"instalacion de camaras de seguridad"
"instalar camaras de seguridad"
"instalacion camaras de seguridad medellin"
"empresa de camaras de seguridad"
"empresas de camaras de seguridad medellin"
"instalacion de cctv"
"cctv para empresas"
"mantenimiento de camaras de seguridad"
"mantenimiento camaras cctv"
"camaras de seguridad para empresas"
"camaras de seguridad para bodegas"
"control de acceso empresas"
[instalacion de camaras de seguridad medellin]
[empresa instalacion camaras medellin]
```

**El verbo es el filtro.** `instalar`, `instalación`, `mantenimiento`,
`empresa de` — todo lo que distingue a quien busca proveedor de quien busca
producto. Es la regla que dejó escrita el planificador: *el término genérico
mide gente comprando aparatos; el término con verbo mide gente contratando.*

**`camaras de seguridad` a secas NO va**, ni en frase. Es el término de
`1K – 10K` y es de compra.

### Palabras clave negativas

Esta lista es la mitad del trabajo. Va a nivel de campaña.

**Bloque 1 — vigilancia encubierta (riesgo de política, no de gasto):**
```
espia, espía, camara espia, mini camara, oculta, camaras ocultas, disimulada,
rastreador, rastrear, gps, monitorear, monitoreo de personas, spy, niñera,
detective, infidelidad
```

**Bloque 2 — intención de compra de producto:**
```
comprar, compra, venta, vender, precio, precios, barata, baratas, economica,
oferta, ofertas, promocion, usada, usadas, segunda mano, mercadolibre,
amazon, alibaba, falabella, exito, homecenter, ktronix, alkosto, tienda,
domicilio, envio
```

**Bloque 3 — marcas de producto** (aparecieron en el planificador; quien busca
marca busca dónde comprarla):
```
ezviz, hikvision, dahua, nexxt, tp-link, imou, xiaomi, wifi, inalambrica,
inalambricas, bateria, solar, 360, panduit
```

**Bloque 4 — residencial y bricolaje:**
```
para casa, casa, apartamento, hogar, como instalar, como, tutorial, youtube,
manual, pdf, curso, cursos, diy, gratis
```

**Bloque 5 — empleo y otros:**
```
empleo, trabajo, vacante, curriculum, tecnico vacante, arriendo, alquiler
```

`wifi` e `inalambrica` en negativo pueden parecer excesivos —MiPC sí instala
cámaras IP— pero en el planificador esos términos son de producto para casa,
no de instalación empresarial. Si alguna vez hay volumen de sobra, se
reconsideran; hoy no lo hay.

### Anuncio adaptable de búsqueda

**Todo lo de abajo tiene que ser cierto y comprobable en la página.** Es la
regla 3 de `CLAUDE.md`, y en Ads además es política.

**Títulos** (30 caracteres máx.):
```
Cámaras de Seguridad Medellín
Instalación de CCTV Empresas
Cableado Propio, No Improvisado
NVR y Grabación en Gabinete
Trabajo en Alturas Certificado
Mantenemos Sistemas de Otros
CCTV para Bodegas y Plantas
Empresa con NIT y 15 Años
Cotización Sin Compromiso
Instalación en el Valle de Aburrá
```

**Descripciones** (90 caracteres máx.):
```
Instalación y mantenimiento de CCTV para empresas, con cableado dedicado y NVR en gabinete.
Atendemos sistemas instalados por otro proveedor. No exigimos cambiar de equipo.
Personal certificado en trabajo en alturas. Obra ejecutada en bodegas, plantas y retail.
Cotizamos después de ver el sitio: cuántas cámaras, qué cubierta y por dónde va el cable.
```

Cada afirmación está respaldada: el cableado dedicado y el NVR en gabinete
salen de los beneficios de la página; el mantenimiento de sistemas ajenos es
una de sus cinco FAQ; el trabajo en alturas está documentado en el proyecto
`criadero-gente-buena`; el NIT y la fundación en 2009, en `empresa.ts`.

**Fijar «Cámaras de Seguridad Medellín» en la posición 1.** Es lo único que
tiene que leerse siempre.

### Recursos

- **Enlaces de sitio:** Proyectos · Nosotros · Contacto · Garantías
- **Textos destacados:** Cableado dedicado · NVR en gabinete · Trabajo en
  alturas certificado · Desde 2009
- **Fragmentos estructurados** (Servicios): CCTV · Alarmas · Control de acceso
  · Contador de personas · Mantenimiento
- **Llamada:** el teléfono de `empresa.ts`, en horario de oficina únicamente
- **Ubicación:** vinculada a la ficha de Google Business (CID en `empresa.ts`)

**No poner recurso de precio.** La página no publica precio de este servicio
—`oferta` está vacío en el frontmatter— y un precio que solo vive en el
anuncio es un precio que nadie ha revisado.

## Cómo se decide si sigue o se apaga

**El error a evitar es juzgarla demasiado pronto.** Con 10–100 búsquedas al
mes, tres semanas pueden dar veinte impresiones, y de veinte impresiones no se
concluye nada. La campaña anterior fijó 22 días porque reparación tenía diez
veces más volumen.

**Duración mínima: 6 semanas**, o hasta acumular **300 impresiones**, lo que
ocurra más tarde.

Antes de ese umbral, la única pregunta válida es «¿está sirviendo?», no «¿está
funcionando?».

Alcanzado el umbral:

| Señal | Lectura | Acción |
|---|---|---|
| 0 impresiones tras 2 semanas | las palabras no tienen volumen o la puja no alcanza | revisar tope de puja antes de culpar al mercado |
| Impresiones sin clics | el anuncio no convence, o la consulta no era lo que parecía | mirar el informe de términos de búsqueda **primero** |
| Clics sin contactos | la página no convierte esa intención | problema de página, no de campaña |
| Cualquier contacto | ya es más de lo que había | seguir y ampliar negativas |

**Revisar el informe de términos de búsqueda cada semana, sin excepción.** Es
donde aparecen las consultas de producto que se colaron, y cada una que se
añada a negativas protege el presupuesto y, más importante, aleja el riesgo de
política.

## Errores que no hay que cometer

1. **Concordancia amplia.** Ni «para probar». Es la puerta a `camara espia`.
2. **Subir el presupuesto porque «no se está gastando».** No se gasta porque
   no hay búsquedas, no porque el presupuesto sea bajo. Subirlo solo compra
   tráfico peor.
3. **Añadir `camaras de seguridad` a secas** viendo que tiene `1K – 10K`. Es
   exactamente la trampa que este documento existe para evitar.
4. **Juzgarla en dos semanas.** Ver el umbral de arriba.
5. **Segmentar por «interés» en vez de «presencia».** Ya pasó una vez.
6. **Editar el anuncio de reparación** que sigue rechazado en la misma cuenta.
   No tiene que ver con esta campaña, pero comparte cuenta: tocarlo lo reenvía
   a revisión.

## Lo que esta campaña no responde

- **Si el mercado B2B de cámaras existe fuera de la búsqueda.** Se vende por
  referido, licitación y relación comercial, canales que Ads no ve. Que haya
  10–100 búsquedas al mes no significa que el servicio no se venda: significa
  que no se vende por búsqueda. Esa distinción ya está escrita en
  `planificador-otros-servicios-2026-09-19.md` y sigue valiendo.
- **Si conviene Rionegro.** Hay tres obras allá y página propia desde el
  2026-09-19, pero no está en `zonaServicio` ni en la ficha de Google.
  Añadirlo partiría un presupuesto ya pequeño. Se decide después, con datos de
  esta campaña.
