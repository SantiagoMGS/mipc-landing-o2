# Por qué rankeamos por barrio y no por ciudad

Comprobado el **2026-09-19** a raíz de una observación de Santiago: que buscando
«reparación de computadores Laureles» el sitio aparece entre los primeros, y
buscando «reparación de computadores Medellín» no aparece.

**Es cierto**, y el motivo es más útil que la confirmación.

---

## Medido

### En el SERP en vivo

| Consulta | Resultado |
|---|---|
| `reparación de computadores laureles` | **4.º en resultados web orgánicos** |
| `reparación de computadores medellin` | **ausente de toda la primera página** |

El fragmento que Google eligió mostrar para la consulta de Laureles es
exactamente el pasaje donde la página nombra el barrio:

> «El taller está en **Laureles**, en la Carrera 66A # 34-48, a pocas cuadras del
> Estadio. Desde ahí atendemos **Laureles, Estadio, Conquistadores,
> Suramericana, La**…»

### En Search Console, mismo periodo

| Consulta | Impresiones | Posición |
|---|---|---|
| `arreglo de computadores medellin` | 32 | 18,7 |
| `reparacion de computadores medellin` | 28 | **20,8** |
| `reparación de portátiles medellín` | 27 | 21,6 |
| `reparación de computadores a domicilio medellín` | 21 | 13,3 |
| `estoy en laureles` | 2 | 2,0 |

Las dos fuentes concuerdan: en consultas con «Medellín» el sitio está en página
2 o 3. No hay ninguna consulta con «Laureles» de volumen apreciable en Search
Console, lo que encaja con que sea un término de nicho —y explica por qué esa
victoria no se veía en los datos hasta que alguien la buscó a mano.

### Quién ocupa la primera página de «Medellín»

`tecnipc.com.co` · `reparacioncomputadores.com.co` · `camipc.com` ·
`databytemedellin.com` · `tirescue.com` · `tecnopaisa.com` ·
`serviciodereparacionneveraslavadorastv.com` · `it-technology.co`, más un perfil
de Instagram.

**Casi todos son sitios de un solo servicio**, y varios llevan la palabra clave
en el propio dominio.

---

## Interpretado

### Por qué se pierde «Medellín»

Es una desventaja **estructural**, no de extensión. Una página de servicio dentro
de un sitio de seis líneas de negocio compite contra dominios que existen solo
para esa consulta. Escribir más palabras en esa página no cambia esa asimetría:
lo que la cambiaría son enlaces, reseñas y autoridad de dominio.

*Se desmentiría* si la página de reparación sube a página 1 tras crecer de 475 a
1.861 palabras —ya creció— sin ganar enlaces ni reseñas. A los 90 días de esta
medición se sabrá.

### Por qué se gana «Laureles»

Porque la página **dice Laureles**, y dice los barrios vecinos, y lo dice
describiendo algo verificable: dónde está el taller. Google encontró ese pasaje
y lo usó como fragmento. Ahí la competencia es escasa y la señal local de MiPC
—ficha verificada en esa dirección— pesa.

### La consecuencia, que reordena la Prioridad 3.4 del diagnóstico

`diagnostico-seo-geo-ads.md` §3.4 propone cinco páginas de municipio —Envigado,
Sabaneta, Itagüí, Bello, La Estrella—. Dos mediciones posteriores la dejan sin
apoyo: Search Console da **cero impresiones** para esos cinco nombres, y el
Planificador midió solo Medellín, así que tampoco la respalda.

**El terreno probado son los barrios de Medellín, no los municipios vecinos.**
Es donde el sitio ya demuestra que rankea, donde está el taller de verdad y
donde hay material real que contar.

---

## Lo que NO hay que concluir de esto

**Generar una página por barrio con el nombre cambiado.** Es exactamente el
fallo que el propio §3.4 advierte: una plantilla repetida es contenido delgado y
Google la trata como tal. La victoria de Laureles no viene de que exista la
palabra «Laureles»: viene de que el pasaje dice **dónde está el taller, en qué
calle y a qué distancia del Estadio**. Eso no se puede repetir cambiando un
sustantivo.

La regla que se deriva: **un barrio merece contenido si hay algo cierto y
específico que decir sobre él.** Si no lo hay, no lo hay.

## Dónde hay material real hoy

Por `lugar` en `src/content/proyectos/`:

| Sitio | Evidencia publicable |
|---|---|
| **Laureles** | El taller, y el video portero de un edificio residencial (2021) |
| **Centro de Medellín** | Bodega El Palo — cableado (2025) |
| **C.C. Oviedo** | Punto de información — iluminación y montaje |
| **C.C. Arkadia** | TOUS — gabinete y rack categoría 6 (2025) |
| **La Estrella** | **Dos proyectos**: Global La Estrella y Obra La Tablaza |

Siete de los doce proyectos registran `lugar: Antioquia` sin precisar más, así
que no sirven para anclar nada local. **Si alguien conoce la ubicación real de
esos siete, precisarla vale más que escribir una página nueva.**

### Una excepción al descarte de los municipios

**La Estrella tiene dos proyectos reales.** Es el único de los cinco municipios
que cumple la condición que el propio diagnóstico exige —«cada página de
municipio debe anclarse a un proyecto real hecho ahí»—. Si alguna vez se hace
una página de municipio, esa es la única con fundamento hoy.

---

## Cómo se midió, y qué lo hace discutible

Las dos búsquedas se hicieron **en el navegador de Santiago, con su sesión de
Google iniciada y desde Medellín**. Eso es personalización y localización en su
máxima expresión, y **sesga a favor de ver el propio sitio**. Una consulta sin
sesión, desde otra ciudad, puede dar otra cosa.

Lo que sostiene la conclusión pese a ese sesgo es que **Search Console coincide**:
posiciones 13 a 22 en las consultas con «Medellín», medidas sobre visitantes
reales y sin personalización. Y que el resultado de Laureles apareció en el
bloque de **resultados web orgánicos**, no en un paquete local.

Conviene tenerlo presente: Search Console **no informa de impresiones en el
paquete local** —esas viven en las estadísticas de la ficha de Google Business—,
así que la visibilidad local real del negocio es mayor que la que se ve aquí, y
no se está midiendo en ningún sitio.
