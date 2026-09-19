# Primera medición de Search Console tras el corte

Datos de `sc-domain:mipc.com.co` leídos por API el **2026-09-19**, sobre la
ventana **2026-08-16 → 2026-09-16** (32 días desde el corte de dominio).

Todo lo de la sección «Medido» sale de un comando que se puede repetir. Lo de
«Interpretado» es razonamiento sobre esos números y puede estar equivocado; se
señala como tal a propósito, igual que en `docs/diagnostico-seo-geo-ads.md`.

Método: `scripts/gsc.mjs`, cuenta de servicio con permiso `siteRestrictedUser`
sobre la propiedad. Las credenciales viven fuera del repositorio
(`~/.config/mipc/gsc.json`, o `$GSC_CREDENCIALES`).

---

## Lo primero: por qué el resumen mentía

La primera lectura de `gsc.mjs resumen` anunció **+22.876 % de impresiones**
frente al periodo anterior. Es falso, y entender por qué importa más que la
cifra.

```
node scripts/gsc.mjs dias
→ Primer día CON datos: 2026-08-13
→ Días con datos: 35 de 152 posibles
```

**La propiedad de dominio empezó a recoger datos el 2026-08-13**, tres días
antes del corte. Search Console no rellena hacia atrás: los días anteriores a
la creación de una propiedad no vienen a cero, vienen ausentes. El periodo
«antes» de esa comparación tenía 3 días de datos, no 32, y sus 114 impresiones
se comparaban contra un mes entero.

`resumen` ahora comprueba la antigüedad de la propiedad y **avisa** cuando la
ventana de comparación la excede, en vez de presentar el artefacto como un
éxito.

**Consecuencia que sigue abierta:** la señal de fallo nº 1 del diagnóstico
—«si a los 60 días hay menos impresiones que las que tenía WordPress, la
migración perdió señal»— **no se puede evaluar con esta propiedad.** No existe
línea base anterior al 13 de agosto. Ver «Lo que sigue sin respuesta».

---

## Medido

### Totales de la propiedad

| Métrica | Valor |
|---|---|
| Impresiones | 26.193 |
| Clics | 33 |
| CTR | 0,1 % |
| Posición media | 7,6 |

### Las dos consultas que se llevan casi todo

```
node scripts/gsc.mjs consultas --desde 2026-08-16
```

| Consulta | Impresiones | Clics | Posición |
|---|---|---|---|
| `laptop repair` | 12.683 | **0** | 8,6 |
| `computer repair` | 11.180 | **0** | 6,2 |

**23.863 impresiones, el 91 % del total, con cero clics.** Desglose:

```
node scripts/gsc.mjs detalle --consulta "laptop repair" --desde 2026-08-16
→ País: col (Colombia), 12.683 impresiones, 0 clics
→ Página: /servicios/reparacion-de-computadores/
```

Ninguna es tráfico extranjero: las dos son de Colombia y aterrizan enteras en
la página de reparación. Por serie diaria, aparecen el **29 de agosto**, pican
el **1 de septiembre** (3.101 impresiones en un día) y se apagan el **11**.

### Las consultas objetivo, sin el ruido

| Consulta | Impresiones | Posición |
|---|---|---|
| `mipc` (marca) | 412 | 6,2 |
| `arreglo de computadores medellin` | 32 | 18,7 |
| `reparacion de computadores medellin` | 28 | 20,8 |
| `reparación de portátiles medellín` | 27 | 21,6 |
| `reparación de computadores a domicilio medellín` | 21 | 13,3 |
| `mantenimiento de computadores medellin` | 17 | 22,3 |

### Páginas

```
node scripts/gsc.mjs paginas --desde 2026-08-16
```

| Sección | Págs. | Clics | Impresiones |
|---|---|---|---|
| servicios | 7 | 18 | 25.064 |
| portada | 4 | 15 | 996 |
| otras | 11 | 0 | 559 |
| blog | 7 | 0 | 57 |
| proyectos | 6 | 0 | 20 |

Descontadas las dos consultas en inglés, la página de reparación queda en unas
1.200 impresiones: sigue siendo la primera del sitio, pero por un margen
normal, no por dos órdenes de magnitud.

### Municipios

```
node scripts/gsc.mjs municipios --desde 2026-08-16
```

| Municipio | Impresiones |
|---|---|
| Medellín | 126 |
| Envigado, Sabaneta, Itagüí, Bello, La Estrella | **0** |

### URLs heredadas de WordPress

`/home/servicios/` (302 impresiones), `/home/servicios-mipc-tecnologia-copy/`
(27), `/home/experiencia/` (13) y `/home/contacto/` (11) siguen apareciendo en
el índice. **Las seis están en `src/data/redirecciones.ts` y responden 301**,
verificado el mismo día contra producción. Es decadencia normal del índice tras
una migración. **Sin acción.**

### Por qué las sumas no cuadran

Los totales de la propiedad (26.193 impresiones, 33 clics) son mayores que la
suma de las filas por consulta (25.001 impresiones, 6 clics). No es un error:
Search Console **omite las consultas poco frecuentes** para no exponer datos de
personas identificables. La diferencia —1.192 impresiones y **27 de los 33
clics**— vive en esas consultas anonimizadas.

Es decir: la mayoría de los clics reales del sitio vienen de búsquedas
demasiado raras para que la herramienta las nombre. No se puede saber cuáles
son, y conviene no sacar conclusiones de la lista de consultas como si fuera
exhaustiva.

---

## Interpretado

Esto ya no son mediciones. Cada punto dice qué lo desmentiría.

**1. El pico de agosto-septiembre no es demanda.** Cero clics en 12.683
impresiones a posición 8,6 es anómalo: a esa posición lo esperable serían unos
200 clics. Un patrón de aparición súbita, pico y decaimiento en trece días,
sobre una consulta en inglés en un sitio en español, se parece más a un
artefacto del índice que a interés real. *Se desmentiría* si vuelve a aparecer
con clics proporcionados, o si se sostiene meses sin decaer.

**2. El contenido movió el sitio, pero no lo suficiente.** Las consultas
objetivo aparecen en posiciones 13 a 22, donde antes no aparecían en absoluto.
Página 2 no recibe clics. *Se desmentiría* si en la próxima medición esas
mismas consultas siguen en la misma posición pese a más contenido: entonces el
problema no es extensión, sino autoridad de dominio o intención, y la respuesta
sería enlaces y reseñas, no más palabras.

**3. Se está perdiendo la consulta de marca.** `mipc` en posición **6,2** con
412 impresiones y 3 clics: hay cinco resultados por delante para el propio
nombre de la empresa. Es coherente con las cinco entidades homónimas
documentadas en `src/data/empresa.ts`. El NIT y el schema están puestos desde
agosto y todavía no han ganado esa consulta. Es la búsqueda más barata de ganar
y la de mayor intención que existe. *Se desmentiría* si la posición mejora sola
en la próxima medición: sería que el schema simplemente necesitaba tiempo.

**4. No hay evidencia para construir las páginas de municipio.** Pero
**cuidado con esta lectura**: Search Console solo informa de consultas en las
que el sitio *apareció*. Cero impresiones para «Envigado» significa «no tenemos
visibilidad ahí», **no** «no hay demanda». Las dos cosas se confunden con
facilidad y llevan a conclusiones opuestas.

Para decidirlo hace falta volumen de búsqueda, que Search Console no da. La
herramienta es el **Planificador de Palabras Clave** de Google Ads, disponible
con la cuenta `AW-18393725809`. Hasta entonces, la Prioridad 3.4 del
diagnóstico sigue sin datos que la respalden ni que la descarten.

---

## Lo que sigue sin respuesta

**¿Conservó la migración el posicionamiento del WordPress?** Sigue sin saberse.
Hace falta una propiedad con histórico anterior al 2026-08-13 —típicamente una
de prefijo de URL (`https://mipc.com.co/`) creada en tiempos del sitio viejo—.
Si existe, basta darle acceso a la misma cuenta de servicio y `gsc.mjs`
funciona contra ella con `--propiedad`.

Si no existe, esa pregunta es irrecuperable: los datos no se pueden reconstruir
hacia atrás. En ese caso la línea base pasa a ser esta medición.

---

## Línea base para la próxima comparación

Para que el mes que viene se compare con algo limpio, **excluyendo las dos
consultas anómalas**:

| Métrica (2026-08-16 → 2026-09-16) | Valor |
|---|---|
| Impresiones sin `laptop repair` ni `computer repair` | ~2.330 |
| Clics | 33 |
| Consultas con nombre de Medellín | 126 impresiones |
| Mejor posición en consulta comercial | 13,3 |
| Posición en consulta de marca (`mipc`) | 6,2 |
| Secciones con cero clics | blog, proyectos |

Repetir con:

```bash
node scripts/gsc.mjs dias                          # ver si hay nuevas anomalías
node scripts/gsc.mjs consultas --desde 2026-09-17
node scripts/gsc.mjs paginas   --desde 2026-09-17
node scripts/gsc.mjs municipios --desde 2026-09-17
```

**Mirar siempre `dias` primero.** Un pico como el de septiembre distorsiona
todos los promedios, y en un total mensual no se ve.
